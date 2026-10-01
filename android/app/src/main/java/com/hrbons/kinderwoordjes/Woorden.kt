package com.hrbons.kinderwoordjes

import org.json.JSONArray

/** Eén woord met de resourcenaam van zijn plaatje (bv. "e_1f415"). */
data class Woord(val tekst: String, val plaatje: String)

data class Categorie(
    val naam: String,
    val plaatje: String,
    val kleur: Int,
    /** Niet schudden, zodat je kunt meetellen. */
    val opVolgorde: Boolean,
    val woorden: List<Woord>,
)

/**
 * Leest assets/woorden.json, dat scripts/android-assets.mjs uit de words.js van de web-app maakt.
 * Puur (geen Android-imports behalve org.json), zodat het in een JVM-test draait.
 */
object Woorden {
    fun lees(json: String): List<Categorie> {
        val lijst = JSONArray(json)
        return (0 until lijst.length()).map { i ->
            val c = lijst.getJSONObject(i)
            val w = c.getJSONArray("woorden")
            Categorie(
                naam = c.getString("naam"),
                plaatje = c.getString("img"),
                kleur = kleur(c.getString("kleur")),
                opVolgorde = c.optBoolean("opVolgorde", false),
                woorden = (0 until w.length()).map { j ->
                    val paar = w.getJSONArray(j)
                    Woord(paar.getString(0), paar.getString(1))
                },
            )
        }
    }

    /** "#ffb74d" naar een ondoorzichtige ARGB-int, zonder android.graphics.Color (dat is een stub in tests). */
    fun kleur(hex: String): Int {
        require(hex.length == 7 && hex[0] == '#') { "kleur: $hex" }
        return (0xFF000000 or hex.substring(1).toLong(16)).toInt()
    }
}
