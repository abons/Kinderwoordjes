package com.hrbons.kinderwoordjes

import android.content.Context
import android.graphics.drawable.Drawable
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.LayerDrawable
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageView
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min

fun Context.dp(v: Float): Int = (v * resources.displayMetrics.density + 0.5f).toInt()
fun View.dp(v: Float): Int = context.dp(v)

/** Een vlak met ronde hoeken en de platte schaduw eronder, zoals --shadow in de web-app (0 6px 0 12% zwart). */
fun Context.vlak(kleur: Int, hoek: Float, schaduw: Float = 6f): Drawable {
    val r = dp(hoek).toFloat()
    val onder = GradientDrawable().apply { cornerRadius = r; setColor(0x1F000000) }
    val boven = GradientDrawable().apply { cornerRadius = r; setColor(kleur) }
    return LayerDrawable(arrayOf(onder, boven)).apply {
        setLayerInset(0, 0, dp(schaduw), 0, 0)
        setLayerInset(1, 0, 0, 0, dp(schaduw))
    }
}

/**
 * Een knop die reageert bij het loslaten, hoe lang de vinger ook bleef liggen. Een gewone OnClickListener
 * doet dat ook, maar een ScrollView en lang indrukken maken het daar onvoorspelbaar; zo staat het vast:
 * verschoven of door de ScrollView overgenomen (CANCEL) is geen tik. De OnClickListener blijft voor
 * TalkBack, dat geen aanraking stuurt maar een klik.
 */
fun View.opTik(actie: () -> Unit) {
    val slop = ViewConfiguration.get(context).scaledTouchSlop * 2f
    val diep = dp(4f).toFloat()
    var x = 0f
    var y = 0f
    var actief = false
    fun los() { actief = false; translationY = 0f }
    setOnTouchListener { _, e ->
        when (e.actionMasked) {
            MotionEvent.ACTION_DOWN -> { x = e.x; y = e.y; actief = true; translationY = diep }
            MotionEvent.ACTION_MOVE -> if (actief && hypot(e.x - x, e.y - y) > slop) los()
            MotionEvent.ACTION_UP -> { val was = actief; los(); if (was) actie() }
            MotionEvent.ACTION_CANCEL -> los()
        }
        true
    }
    setOnClickListener { actie() }
}

/** Een vierkant plaatje: [fractie] van de beschikbare breedte, hoogstens [max] px. */
class Vierkant(context: Context, private val fractie: Float, private val max: Int) : ImageView(context) {
    init {
        scaleType = ScaleType.FIT_CENTER
        importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val s = min((MeasureSpec.getSize(widthMeasureSpec) * fractie).toInt(), max)
        setMeasuredDimension(s, s)
    }
}

/**
 * Het tegelraster van het beginscherm, als `repeat(auto-fill, minmax(min(42vw, 190px), 1fr))` in de
 * web-app: zoveel kolommen als er passen, even breed, en elke rij zo hoog als zijn hoogste tegel.
 */
class Raster(context: Context) : ViewGroup(context) {
    private val gat = dp(16f)
    private var kolommen = 2

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val w = MeasureSpec.getSize(widthMeasureSpec)
        val binnen = w - paddingLeft - paddingRight
        val minKol = min(w * 0.42f, dp(190f).toFloat())
        kolommen = max(1, ((binnen + gat) / (minKol + gat)).toInt())
        val breed = MeasureSpec.makeMeasureSpec((binnen - (kolommen - 1) * gat) / kolommen, MeasureSpec.EXACTLY)
        var h = paddingTop + paddingBottom
        for (rij in 0 until (childCount + kolommen - 1) / kolommen) {
            val tegels = (rij * kolommen until min(childCount, (rij + 1) * kolommen)).map { getChildAt(it) }
            tegels.forEach { it.measure(breed, MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED)) }
            // elke tegel even hoog als de hoogste in zijn rij, zodat de vlakken op één lijn staan
            val hoog = tegels.maxOf { it.measuredHeight }
            tegels.forEach { it.measure(breed, MeasureSpec.makeMeasureSpec(hoog, MeasureSpec.EXACTLY)) }
            h += hoog + if (rij > 0) gat else 0
        }
        setMeasuredDimension(w, h)
    }

    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
        var y = paddingTop
        for (i in 0 until childCount) {
            val c = getChildAt(i)
            val k = i % kolommen
            if (k == 0 && i > 0) y += getChildAt(i - 1).measuredHeight + gat
            val x = paddingLeft + k * (c.measuredWidth + gat)
            c.layout(x, y, x + c.measuredWidth, y + c.measuredHeight)
        }
    }
}

/**
 * De kaart: het plaatje is min(70% van de breedte, 55% van de hoogte), zoals in de web-app. Dat hangt
 * af van het hele scherm, dus het wordt hier gezet en niet in het plaatje zelf.
 */
class KaartLayout(context: Context, private val plaatje: View, private val bijMaat: (Int, Int) -> Unit) : FrameLayout(context) {
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val w = MeasureSpec.getSize(widthMeasureSpec) - paddingLeft - paddingRight
        val h = MeasureSpec.getSize(heightMeasureSpec) - paddingTop - paddingBottom
        val s = min(w * 0.7f, h * 0.55f).toInt()
        plaatje.layoutParams.width = s
        plaatje.layoutParams.height = s
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        post { bijMaat(w - paddingLeft - paddingRight, h - paddingTop - paddingBottom) }
    }
}
