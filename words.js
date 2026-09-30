/* Categorieën en woorden. Ook ingelezen door sw.js (importScripts) om alle plaatjes vooraf te cachen.
 * Plaatje = Twemoji-bestandsnaam (codepoint) in img/. Nieuwe woorden: voeg toe en draai
 * `node scripts/copy-emoji.mjs <pad-naar-@twemoji/svg>`. */
self.CATEGORIES = [
  { id: "dieren", naam: "Dieren", img: "1f436", kleur: "#ffb74d", woorden: [
    ["hond", "1f415"], ["kat", "1f408"], ["koe", "1f404"], ["varken", "1f416"], ["paard", "1f40e"],
    ["schaap", "1f411"], ["kip", "1f414"], ["eend", "1f986"], ["olifant", "1f418"], ["leeuw", "1f981"],
    ["aap", "1f412"], ["beer", "1f43b"], ["konijn", "1f407"], ["vis", "1f41f"], ["vogel", "1f426"],
    ["muis", "1f401"], ["giraf", "1f992"], ["zebra", "1f993"], ["uil", "1f989"], ["vlinder", "1f98b"],
    ["slak", "1f40c"], ["kikker", "1f438"], ["schildpad", "1f422"], ["pinguïn", "1f427"],
  ] },
  { id: "eten", naam: "Eten", img: "1f34e", kleur: "#e57373", woorden: [
    ["appel", "1f34e"], ["banaan", "1f34c"], ["peer", "1f350"], ["aardbei", "1f353"], ["druiven", "1f347"],
    ["sinaasappel", "1f34a"], ["kers", "1f352"], ["citroen", "1f34b"], ["watermeloen", "1f349"],
    ["tomaat", "1f345"], ["wortel", "1f955"], ["komkommer", "1f952"], ["brood", "1f35e"], ["kaas", "1f9c0"],
    ["ei", "1f95a"], ["melk", "1f95b"], ["koekje", "1f36a"], ["taart", "1f370"], ["ijsje", "1f366"],
    ["pizza", "1f355"],
  ] },
  { id: "vervoer", naam: "Vervoer", img: "1f697", kleur: "#64b5f6", woorden: [
    ["auto", "1f697"], ["bus", "1f68c"], ["trein", "1f682"], ["vliegtuig", "2708"], ["boot", "26f5"],
    ["fiets", "1f6b2"], ["brandweerauto", "1f692"], ["politieauto", "1f693"], ["ambulance", "1f691"],
    ["tractor", "1f69c"], ["vrachtwagen", "1f69a"], ["helikopter", "1f681"], ["raket", "1f680"],
    ["motor", "1f3cd"], ["step", "1f6f4"],
  ] },
  { id: "lichaam", naam: "Mijn lijf", img: "1f44b", kleur: "#f06292", woorden: [
    ["hand", "270b"], ["voet", "1f9b6"], ["been", "1f9b5"], ["oog", "1f441"], ["oor", "1f442"],
    ["neus", "1f443"], ["mond", "1f444"], ["tong", "1f445"], ["tand", "1f9b7"], ["duim", "1f44d"],
  ] },
  { id: "kleding", naam: "Kleren", img: "1f455", kleur: "#ba68c8", woorden: [
    ["shirt", "1f455"], ["broek", "1f456"], ["jurk", "1f457"], ["sokken", "1f9e6"], ["schoen", "1f45f"],
    ["laars", "1f462"], ["jas", "1f9e5"], ["pet", "1f9e2"], ["sjaal", "1f9e3"], ["wanten", "1f9e4"],
    ["bril", "1f453"], ["hoed", "1f3a9"],
  ] },
  { id: "buiten", naam: "Buiten", img: "1f333", kleur: "#81c784", woorden: [
    ["zon", "2600"], ["maan", "1f319"], ["ster", "2b50"], ["wolk", "2601"], ["regen", "1f327"],
    ["regenboog", "1f308"], ["bloem", "1f337"], ["boom", "1f333"], ["blad", "1f343"],
    ["paddenstoel", "1f344"], ["sneeuwpop", "26c4"], ["zee", "1f30a"], ["berg", "26f0"],
  ] },
  { id: "speelgoed", naam: "Speelgoed", img: "1f9f8", kleur: "#4db6ac", woorden: [
    ["bal", "26bd"], ["ballon", "1f388"], ["knuffel", "1f9f8"], ["vlieger", "1fa81"], ["jojo", "1fa80"],
    ["trommel", "1f941"], ["gitaar", "1f3b8"], ["puzzel", "1f9e9"], ["cadeau", "1f381"], ["blokken", "1f9f1"],
  ] },
  { id: "thuis", naam: "Thuis", img: "1f3e0", kleur: "#ffd54f", woorden: [
    ["huis", "1f3e0"], ["bed", "1f6cf"], ["stoel", "1fa91"], ["deur", "1f6aa"], ["lamp", "1f4a1"],
    ["klok", "23f0"], ["boek", "1f4d6"], ["telefoon", "1f4f1"], ["tandenborstel", "1faa5"], ["zeep", "1f9fc"],
    ["bad", "1f6c1"], ["wc", "1f6bd"], ["sleutel", "1f511"], ["lepel", "1f944"], ["kopje", "2615"],
    ["tv", "1f4fa"],
  ] },
];
