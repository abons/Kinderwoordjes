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
  { id: "fruit", naam: "Fruit", img: "1f34e", kleur: "#e57373", woorden: [
    ["appel", "1f34e"], ["banaan", "1f34c"], ["peer", "1f350"], ["aardbei", "1f353"], ["druiven", "1f347"],
    ["sinaasappel", "1f34a"], ["kersen", "1f352"], ["citroen", "1f34b"], ["watermeloen", "1f349"],
    ["meloen", "1f348"], ["ananas", "1f34d"], ["perzik", "1f351"], ["kiwi", "1f95d"], ["mango", "1f96d"],
    ["bosbessen", "1fad0"], ["kokosnoot", "1f965"],
  ] },
  { id: "groente", naam: "Groente", img: "1f955", kleur: "#aed581", woorden: [
    ["wortel", "1f955"], ["tomaat", "1f345"], ["komkommer", "1f952"], ["broccoli", "1f966"], ["maïs", "1f33d"],
    ["paprika", "1fad1"], ["aardappel", "1f954"], ["ui", "1f9c5"], ["knoflook", "1f9c4"], ["erwten", "1fadb"],
    ["sla", "1f96c"], ["aubergine", "1f346"],
  ] },
  { id: "eten", naam: "Eten", img: "1f35e", kleur: "#ffab91", woorden: [
    ["brood", "1f35e"], ["kaas", "1f9c0"], ["ei", "1f95a"], ["melk", "1f95b"], ["koekje", "1f36a"],
    ["taart", "1f370"], ["ijsje", "1f366"], ["pizza", "1f355"], ["pannenkoek", "1f95e"], ["patat", "1f35f"],
    ["hamburger", "1f354"], ["snoepje", "1f36c"], ["lolly", "1f36d"], ["chocola", "1f36b"], ["soep", "1f372"],
    ["sap", "1f9c3"],
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
    ["laars", "1f462"], ["jas", "1f9e5"], ["pet", "1f9e2"], ["sjaal", "1f9e3"], ["handschoenen", "1f9e4"],
    ["bril", "1f453"], ["hoed", "1f3a9"],
  ] },
  { id: "buiten", naam: "Buiten", img: "1f333", kleur: "#81c784", woorden: [
    ["zon", "2600"], ["maan", "1f319"], ["ster", "2b50"], ["wolk", "2601"], ["regen", "1f327"],
    ["regenboog", "1f308"], ["bloem", "1f337"], ["boom", "1f333"], ["blad", "1f343"],
    ["paddenstoel", "1f344"], ["sneeuwpop", "26c4"], ["golf", "1f30a"], ["berg", "26f0"],
  ] },
  { id: "speelgoed", naam: "Speelgoed", img: "1f9f8", kleur: "#4db6ac", woorden: [
    ["bal", "26bd"], ["ballon", "1f388"], ["knuffel", "1f9f8"], ["vlieger", "1fa81"], ["jojo", "1fa80"],
    ["trommel", "1f941"], ["gitaar", "1f3b8"], ["puzzel", "1f9e9"], ["cadeau", "1f381"],
  ] },
  { id: "thuis", naam: "Thuis", img: "1f3e0", kleur: "#ffd54f", woorden: [
    ["huis", "1f3e0"], ["bed", "1f6cf"], ["stoel", "1fa91"], ["deur", "1f6aa"], ["lampje", "1f4a1"],
    ["klok", "23f0"], ["boek", "1f4d6"], ["telefoon", "1f4f1"], ["tandenborstel", "1faa5"], ["zeep", "1f9fc"],
    ["bad", "1f6c1"], ["wc", "1f6bd"], ["sleutel", "1f511"], ["lepel", "1f944"], ["kopje", "2615"],
    ["tv", "1f4fa"],
  ] },
  { id: "zee", naam: "In de zee", img: "1f433", kleur: "#4fc3f7", woorden: [
    ["walvis", "1f433"], ["dolfijn", "1f42c"], ["haai", "1f988"], ["krab", "1f980"], ["octopus", "1f419"],
    ["kwal", "1fabc"], ["schelp", "1f41a"], ["zeehond", "1f9ad"], ["garnaal", "1f990"], ["kogelvis", "1f421"],
  ] },
  { id: "beestjes", naam: "Beestjes", img: "1f41e", kleur: "#dce775", woorden: [
    ["bij", "1f41d"], ["lieveheersbeestje", "1f41e"], ["mier", "1f41c"], ["rups", "1f41b"], ["spin", "1f577"],
    ["worm", "1fab1"], ["kever", "1fab2"], ["vlieg", "1fab0"], ["mug", "1f99f"], ["sprinkhaan", "1f997"],
  ] },
  { id: "bos", naam: "In het bos", img: "1f98a", kleur: "#a1887f", woorden: [
    ["vos", "1f98a"], ["hert", "1f98c"], ["eekhoorn", "1f43f"], ["egel", "1f994"], ["wolf", "1f43a"],
    ["das", "1f9a1"], ["wild zwijn", "1f417"], ["dennenboom", "1f332"], ["kastanje", "1f330"],
  ] },
  { id: "familie", naam: "Familie", img: "1f46a", kleur: "#f8bbd0", woorden: [
    ["baby", "1f476"], ["jongen", "1f466"], ["meisje", "1f467"], ["mama", "1f469"], ["papa", "1f468"],
    ["opa", "1f474"], ["oma", "1f475"],
  ] },
  { id: "kleuren", naam: "Kleuren", img: "1f3a8", kleur: "#fff59d", woorden: [
    ["rood", "1f534"], ["blauw", "1f535"], ["geel", "1f7e1"], ["groen", "1f7e2"], ["oranje", "1f7e0"],
    ["paars", "1f7e3"], ["bruin", "1f7e4"], ["zwart", "26ab"], ["wit", "26aa"],
  ] },
  { id: "vormen", naam: "Vormen", img: "1f537", kleur: "#9fa8da", woorden: [
    ["cirkel", "1f535"], ["vierkant", "1f7e5"], ["driehoek", "1f53a"], ["ster", "2b50"], ["hart", "2764"],
    ["ruit", "1f537"],
  ] },
  { id: "feest", naam: "Feest", img: "1f389", kleur: "#f48fb1", woorden: [
    ["feest", "1f389"], ["ballon", "1f388"], ["cadeau", "1f381"], ["taart", "1f382"], ["kaarsje", "1f56f"],
    ["confetti", "1f38a"], ["muziek", "1f3b5"], ["feesthoedje", "1f973"],
  ] },
  // opVolgorde: niet schudden, zodat je kunt meetellen
  { id: "getallen", naam: "Tellen", img: "33-20e3", kleur: "#90caf9", opVolgorde: true, woorden: [
    ["één", "31-20e3"], ["twee", "32-20e3"], ["drie", "33-20e3"], ["vier", "34-20e3"], ["vijf", "35-20e3"],
    ["zes", "36-20e3"], ["zeven", "37-20e3"], ["acht", "38-20e3"], ["negen", "39-20e3"], ["tien", "1f51f"],
  ] },
];
