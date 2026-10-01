package com.hrbons.kinderwoordjes

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * Leest de echte assets/woorden.json en res/drawable van schijf (daarom staan die als test-input in
 * app/build.gradle): elk plaatje dat een woord noemt moet bestaan, anders crasht de app op die kaart.
 */
class WoordenTest {
    private val main = File("src/main")
    private val categorieen = Woorden.lees(File(main, "assets/woorden.json").readText())

    @Test
    fun elkPlaatjeBestaat() {
        val ontbreekt = categorieen.flatMap { c -> listOf(c.plaatje) + c.woorden.map { it.plaatje } }
            .distinct()
            .filter { !File(main, "res/drawable/$it.xml").exists() }
        assertEquals(emptyList<String>(), ontbreekt)
        assertTrue(File(main, "res/drawable/e_1f3e0.xml").exists()) // het huisje
    }

    @Test
    fun geenLegeCategorieEnTellenOpVolgorde() {
        assertTrue(categorieen.size > 5)
        assertTrue(categorieen.all { it.woorden.isNotEmpty() })
        val tellen = categorieen.single { it.naam == "Tellen" }
        assertTrue(tellen.opVolgorde)
        assertEquals("één", tellen.woorden.first().tekst)
    }

    @Test
    fun kleur() {
        assertEquals(0xFFFFB74D.toInt(), Woorden.kleur("#ffb74d"))
    }
}
