package com.hrbons.kinderwoordjes

import kotlin.random.Random

/**
 * De volgorde van de woorden in een categorie, net als in de web-app: geschud, en na de laatste opnieuw
 * geschud zonder dat hetzelfde woord twee keer achter elkaar komt. Bij [opVolgorde] gewoon op volgorde
 * en dan weer vooraan. Puur, zodat het in een JVM-test draait.
 */
class Rij<T>(private val items: List<T>, private val opVolgorde: Boolean, private val random: Random = Random.Default) {
    init {
        require(items.isNotEmpty()) { "lege categorie" }
    }

    private var rij: List<T> = if (opVolgorde) items else items.shuffled(random)
    private var pos = 0

    val huidig: T get() = rij[pos]

    fun volgende(): T {
        if (++pos >= rij.size) {
            pos = 0
            if (!opVolgorde) {
                val vorige = rij.last()
                val nieuw = items.shuffled(random).toMutableList()
                if (nieuw.size > 1 && nieuw[0] == vorige) nieuw.add(nieuw.removeAt(0))
                rij = nieuw
            }
        }
        return huidig
    }
}
