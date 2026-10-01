package com.hrbons.kinderwoordjes

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test
import kotlin.random.Random

class RijTest {
    @Test
    fun opVolgordeBlijftOpVolgordeEnBegintWeerVooraan() {
        val rij = Rij(listOf(1, 2, 3), opVolgorde = true)
        val gezien = listOf(rij.huidig) + (1..6).map { rij.volgende() }
        assertEquals(listOf(1, 2, 3, 1, 2, 3, 1), gezien)
    }

    @Test
    fun elkeRondeElkWoordEenKeerEnNooitTweeKeerAchterElkaar() {
        for (seed in 0 until 200) {
            val items = (1..5).toList()
            val rij = Rij(items, opVolgorde = false, random = Random(seed))
            var vorige = rij.huidig
            val ronde = mutableListOf(vorige)
            repeat(5 * 20 - 1) {
                val nu = rij.volgende()
                assertNotEquals("seed $seed", vorige, nu)
                ronde += nu
                if (ronde.size == items.size) {
                    assertEquals("seed $seed", items, ronde.sorted())
                    ronde.clear()
                }
                vorige = nu
            }
        }
    }

    @Test
    fun eenWoordGaatGewoonDoor() {
        val rij = Rij(listOf("bal"), opVolgorde = false)
        assertEquals("bal", rij.volgende())
    }
}
