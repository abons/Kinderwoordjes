package com.hrbons.kinderwoordjes

import android.app.Activity
import android.content.res.Configuration
import android.graphics.Paint
import android.graphics.Typeface
import android.text.TextPaint
import android.media.AudioManager
import android.os.Build
import android.os.Bundle
import android.os.SystemClock
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.TypedValue
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.view.animation.OvershootInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.window.OnBackInvokedDispatcher
import java.util.Locale

/**
 * Woordjes voor peuters, hetzelfde als de web-app: kies een categorie, zie een groot plaatje met het woord.
 * De eerste tik leest het woord voor, de tweede gaat verder; zonder (Nederlandse) stem gaat één tik verder.
 *
 * Wat de app native extra doet, omdat het om kleine kinderen gaat: de kaart reageert al bij het neerzetten
 * van de vinger (lang indrukken maakt niet uit), terug op het beginscherm sluit de app niet, de systeembalken
 * zijn weg (vegen haalt ze even terug) en het scherm blijft aan zolang er een kaart open is.
 */
class MainActivity : Activity() {
    private val tekstKleur = 0xFF3B2F2F.toInt()
    private val achtergrond = 0xFFFFF4E0.toInt()
    private val wit = 0xFFFFFFFF.toInt()
    // "casual" (Coming Soon) is de kinderletter van Android; hij heeft geen vette variant, dus komt het vet
    // van FAKE_BOLD_TEXT_FLAG op elke tekst.
    private val letter by lazy { Typeface.create("casual", Typeface.NORMAL) }

    private lateinit var categorieen: List<Categorie>
    private lateinit var scherm: FrameLayout
    private var home: View? = null
    private lateinit var kaart: KaartLayout
    private lateinit var plaatje: ImageView
    private lateinit var woord: TextView
    private lateinit var geluidKnop: TextView

    private var rij: Rij<Woord>? = null
    private var gezegd = false
    private var laatste = 0L
    private val opKaart get() = kaart.visibility == View.VISIBLE

    private val prefs by lazy { getSharedPreferences("woordjes", MODE_PRIVATE) }
    private var geluidAan = true
    private var tts: TextToSpeech? = null
    private var stemOk = false
    private var spraakKapot = false // de stem gaf een fout: dan gaat één tik verder, anders kost elk woord een dode tik
    private val kanPraten get() = geluidAan && stemOk && !spraakKapot

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        categorieen = Woorden.lees(assets.open("woorden.json").bufferedReader().use { it.readText() })
        geluidAan = prefs.getBoolean("geluid", true)
        volumeControlStream = AudioManager.STREAM_MUSIC

        scherm = FrameLayout(this).apply { setBackgroundColor(achtergrond) }
        bouwKaart()
        bouwHome()
        setContentView(scherm)
        randen()
        schermVullend()
        startStem()

        if (Build.VERSION.SDK_INT >= 33) {
            // Altijd afvangen: op de kaart naar de categorieën, op het beginscherm niets (de app blijft open).
            onBackInvokedDispatcher.registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT) { terug() }
        }
    }

    @Deprecated("Vanaf API 33 via onBackInvokedDispatcher")
    override fun onBackPressed() = terug() // bewust geen super: dat zou de app sluiten

    private fun terug() {
        if (opKaart) naarHome()
    }

    // ---- schermen ----

    private fun bouwHome() {
        val breed = resources.displayMetrics.widthPixels.toFloat()
        val px = { v: Float -> dp(v).toFloat() }
        val titel = TextView(this).apply {
            text = getString(R.string.titel)
            typeface = letter
            paintFlags = paintFlags or Paint.FAKE_BOLD_TEXT_FLAG
            setTextColor(tekstKleur)
            setTextSize(TypedValue.COMPLEX_UNIT_PX, (breed * 0.06f).coerceIn(px(24f), px(40f)))
        }
        geluidKnop = TextView(this).apply {
            gravity = Gravity.CENTER
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 24f)
            background = vlak(wit, 28f, 4f)
            opTik { geluidAan = !geluidAan; prefs.edit().putBoolean("geluid", geluidAan).apply(); toonGeluid() }
        }
        toonGeluid()
        val kop = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(16f), dp(14f), dp(16f), dp(4f))
            addView(titel, LinearLayout.LayoutParams(0, WRAP_CONTENT, 1f))
            addView(geluidKnop, LinearLayout.LayoutParams(dp(56f), dp(60f)))
        }
        val raster = Raster(this).apply { setPadding(dp(16f), dp(12f), dp(16f), dp(24f)) }
        val labelMaat = (breed * 0.05f).coerceIn(px(20f), px(28f))
        for (cat in categorieen) raster.addView(tegel(cat, labelMaat))
        val lijst = ScrollView(this).apply {
            isVerticalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
            addView(raster)
        }
        val nieuw = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            addView(kop, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT))
            addView(lijst, LinearLayout.LayoutParams(MATCH_PARENT, 0, 1f))
            visibility = if (home == null || home?.visibility == View.VISIBLE) View.VISIBLE else View.GONE
        }
        home?.let { scherm.removeView(it) }
        home = nieuw
        scherm.addView(nieuw, 0, FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT))
    }

    private fun tegel(cat: Categorie, labelMaat: Float) = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        gravity = Gravity.CENTER_HORIZONTAL
        background = vlak(cat.kleur, 28f)
        setPadding(dp(8f), dp(14f), dp(8f), dp(12f + 6f))
        addView(Vierkant(context, 0.7f, dp(130f)).apply { setImageResource(plaatjeId(cat.plaatje)) },
            LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT))
        addView(TextView(context).apply {
            text = cat.naam
            typeface = letter
            paintFlags = paintFlags or Paint.FAKE_BOLD_TEXT_FLAG
            gravity = Gravity.CENTER
            setTextColor(tekstKleur)
            setTextSize(TypedValue.COMPLEX_UNIT_PX, labelMaat)
        }, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT).apply { topMargin = dp(8f) })
        contentDescription = cat.naam
        opTik { start(cat) }
    }

    private fun bouwKaart() {
        plaatje = ImageView(this).apply { scaleType = ImageView.ScaleType.FIT_XY } // vierkant; zie Vierkant
        woord = TextView(this).apply {
            typeface = letter
            paintFlags = paintFlags or Paint.FAKE_BOLD_TEXT_FLAG
            gravity = Gravity.CENTER
            setTextColor(tekstKleur)
            maxLines = 1
            letterSpacing = 0.02f
        }
        val midden = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            addView(plaatje, LinearLayout.LayoutParams(0, 0))
            addView(woord, LinearLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT))
        }
        val huisje = ImageView(this).apply {
            setImageResource(plaatjeId("e_1f3e0"))
            background = vlak(wit, 36f, 4f)
            setPadding(dp(14f), dp(14f), dp(14f), dp(18f))
            contentDescription = getString(R.string.terug)
            opTik { terug() }
        }
        kaart = KaartLayout(this, plaatje) { w, h -> pasWoord(w, h) }.apply {
            visibility = View.GONE
            addView(midden, FrameLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT, Gravity.CENTER))
            addView(huisje, FrameLayout.LayoutParams(dp(72f), dp(76f)).apply { leftMargin = dp(14f); topMargin = dp(14f) })
            // De kaart reageert al bij het neerzetten van de (eerste) vinger: lang ingedrukt houden of een
            // tweede vinger maakt dan niets meer uit. Het huisje vangt zijn eigen aanraking af.
            setOnTouchListener { _, e ->
                if (e.actionMasked == MotionEvent.ACTION_DOWN) tik()
                true
            }
            setOnClickListener { tik() } // TalkBack
        }
        scherm.addView(kaart, FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT))
    }

    /** clamp(44px, 13vw, 110px) zoals de web-app, en kleiner als een lang woord anders niet past. */
    private fun pasWoord(w: Int = kaart.width, h: Int = kaart.height) {
        if (w <= 0) return
        (woord.layoutParams as LinearLayout.LayoutParams).topMargin = (h * 0.04f).toInt()
        woord.requestLayout()
        var maat = (w * 0.13f).coerceIn(dp(44f).toFloat(), dp(110f).toFloat())
        val ruimte = w - dp(32f)
        // Meten op een kopie: zet je de maat op woord.paint zelf, dan ziet setTextSize hieronder geen
        // verschil, en blijft de TextView op zijn oude (kleine) maat staan.
        val meet = TextPaint(woord.paint).apply { textSize = maat }
        val nodig = meet.measureText(woord.text.toString()) // inclusief letterSpacing
        if (nodig > ruimte) maat *= ruimte / nodig
        woord.setTextSize(TypedValue.COMPLEX_UNIT_PX, maat)
    }

    private fun start(cat: Categorie) {
        if (opKaart) return // twee vingers op twee tegels
        rij = Rij(cat.woorden, cat.opVolgorde)
        // Was de stem kapot of nog niet Nederlands (bv. stem werd net gedownload)? Bij elke categorie
        // opnieuw proberen, anders blijft hij stil tot de app opnieuw start.
        if (spraakKapot || !stemOk) {
            tts?.shutdown()
            spraakKapot = false
            stemOk = false
            startStem()
        }
        laatste = SystemClock.uptimeMillis()
        home?.visibility = View.GONE
        kaart.visibility = View.VISIBLE
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        toon()
    }

    private fun naarHome() {
        tts?.stop()
        kaart.visibility = View.GONE
        home?.visibility = View.VISIBLE
        window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    private fun toon() {
        val w = rij?.huidig ?: return
        plaatje.setImageResource(plaatjeId(w.plaatje))
        woord.text = w.tekst
        pasWoord()
        for (v in listOf(plaatje, woord)) {
            v.animate().cancel()
            v.scaleX = 0.4f; v.scaleY = 0.4f; v.alpha = 0f
            v.animate().scaleX(1f).scaleY(1f).alpha(1f).setDuration(350).setInterpolator(OvershootInterpolator(2f)).start()
        }
        gezegd = false
    }

    // Wild tikken van kleine handjes niet laten doorrazen.
    private fun tikMag(): Boolean {
        val nu = SystemClock.uptimeMillis()
        if (nu - laatste < 400) return false
        laatste = nu
        return true
    }

    // Eerst kijken: de eerste tik zegt het woord, de tweede gaat verder.
    private fun tik() {
        if (!opKaart || !tikMag()) return
        val w = rij?.huidig ?: return
        if (kanPraten && !gezegd && zeg(w.tekst)) {
            gezegd = true
        } else {
            tts?.stop() // niet het oude woord horen bij het nieuwe plaatje
            rij?.volgende()
            toon()
        }
    }

    private val plaatjes = HashMap<String, Int>()
    private fun plaatjeId(naam: String) = plaatjes.getOrPut(naam) {
        resources.getIdentifier(naam, "drawable", packageName).also { require(it != 0) { "plaatje ontbreekt: $naam" } }
    }

    private fun toonGeluid() {
        geluidKnop.text = if (geluidAan) "🔊" else "🔇"
        geluidKnop.contentDescription = getString(if (geluidAan) R.string.voorlezen_aan else R.string.voorlezen_uit)
    }

    // ---- voorlezen ----

    private fun startStem() {
        var nieuw: TextToSpeech? = null
        nieuw = TextToSpeech(applicationContext) { status ->
            val t = nieuw ?: return@TextToSpeech
            if (t !== tts) return@TextToSpeech // een oudere, al afgesloten instantie
            if (status != TextToSpeech.SUCCESS) return@TextToSpeech
            // Geen Nederlandse stem? Dan zwijgen: een Engelse stem leert verkeerde klanken.
            stemOk = t.setLanguage(Locale("nl", "NL")) >= TextToSpeech.LANG_AVAILABLE &&
                // Google TTS meldt een stem die nog gedownload moet worden als beschikbaar
                t.voice?.features?.contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED) != true
            t.setSpeechRate(0.8f)
            t.setPitch(1.1f)
            t.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {}
                override fun onDone(utteranceId: String?) {}
                @Deprecated("Deprecated in Java")
                override fun onError(utteranceId: String?) { runOnUiThread { spraakKapot = true } }
            })
        }
        tts = nieuw
    }

    /** false als de stem het niet aanneemt (bv. de TTS-dienst is herstart): dan gaat deze tik gewoon verder. */
    private fun zeg(tekst: String): Boolean {
        val ok = tts?.speak(tekst, TextToSpeech.QUEUE_FLUSH, null, "woord") == TextToSpeech.SUCCESS
        if (!ok) spraakKapot = true
        return ok
    }

    override fun onStop() {
        super.onStop()
        tts?.stop()
    }

    override fun onDestroy() {
        tts?.shutdown()
        tts = null
        super.onDestroy()
    }

    // ---- scherm ----

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        bouwHome() // de maten hangen af van de breedte; de kaart past zich zelf aan
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) schermVullend()
    }

    /** Geen status- en navigatiebalk: dan tikt een peuter niet per ongeluk op terug of home. */
    private fun schermVullend() {
        if (Build.VERSION.SDK_INT >= 30) {
            window.insetsController?.apply {
                hide(WindowInsets.Type.systemBars())
                systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION)
        }
    }

    /**
     * Tot in de hoeken tekenen, maar uit de camera-uitsparing blijven. Vanaf API 30 ook uit balken die niet
     * weg kunnen (gesplitst scherm, vensters): verborgen balken tellen daar als 0. Daaronder alleen de
     * uitsparing, want met LAYOUT_STABLE melden verborgen balken toch hun maat.
     */
    private fun randen() {
        if (Build.VERSION.SDK_INT >= 28) {
            window.attributes = window.attributes.apply {
                layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
            }
        }
        if (Build.VERSION.SDK_INT >= 30) window.setDecorFitsSystemWindows(false)
        scherm.setOnApplyWindowInsetsListener { v, ins ->
            when {
                Build.VERSION.SDK_INT >= 30 -> ins.getInsets(WindowInsets.Type.systemBars() or WindowInsets.Type.displayCutout())
                    .let { v.setPadding(it.left, it.top, it.right, it.bottom) }
                Build.VERSION.SDK_INT >= 28 -> ins.displayCutout.let { v.setPadding(it?.safeInsetLeft ?: 0, it?.safeInsetTop ?: 0, it?.safeInsetRight ?: 0, it?.safeInsetBottom ?: 0) }
            }
            ins
        }
    }
}
