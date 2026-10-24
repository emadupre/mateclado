export const CATEGORIES = {
  argentinismo: 'Argentinismo',
  lunfardo: 'Lunfardo',
  indigena: 'Origen indígena',
  regional: 'Regional',
}

const ORIGEN_DISCUTIDO = 'Su origen es discutido: hay varias hipótesis y ninguna está confirmada.'

/**
 * Campos de cada ficha (los valores de abajo son los predeterminados):
 * -forms : cómo aparece la palabra en las frases del juego. Usá formas especificas:
 * <<todo joya>> y no <<joya>> pq tambien es una alhaja.
 * - origin: null si todavía no está documentado.
 * - reviewed: true cuando alguien con conocimiento verificó la ficha.
 * - allAges: false para lo que no debe aparecer en el juego: 'note' explica el motivo.
 */

const ficha = (datos) => ({
  category: 'argentinismo',
  region: 'Argentina',
  origin: null,
  sources: [],
  reviewed: false,
  allAges: true,
  note: null,
  ...datos,
})

export const GLOSARIO = [
  // -- aptas para todo publico --
  ficha({
    id: 'che',
    term: 'Che',
    forms: ['che'],
    meaning:
      'Palabra para llamar la atención de alguien o para hablarle con confianza, sobre todo entre amigos y familia.',
    origin: ORIGEN_DISCUTIDO,
  }),
  ficha({
    id: 'pibe',
    term: 'Pibe, piba',
    forms: ['pibe', 'pibes', 'piba', 'pibas'],
    meaning:
      'Chico o chica. En el habla de todos los días se usa para hablar de niños y jóvenes, y también entre amigos.',
    origin: ORIGEN_DISCUTIDO,
  }),
  ficha({
    id: 'tipo',
    term: 'Tipo',
    region: 'Argentina y otros países',
    forms: ['ese tipo'],
    meaning: 'Hombre, persona. En el habla informal se usa en lugar de «señor» o «hombre».',
  }),
  ficha({
    id: 'changa',
    term: 'Changa',
    forms: ['changa', 'changas'],
    meaning:
      'Trabajo corto y ocasional, que se hace por un rato o por unos días y no es un empleo fijo.',
  }),
  ficha({
    id: 'pochoclos',
    term: 'Pochoclos',
    forms: ['pochoclo', 'pochoclos'],
    meaning: 'Las palomitas de maíz que se comen, por ejemplo, en el cine.',
  }),
  ficha({
    id: 'tomatelas',
    term: 'Tomátelas',
    forms: ['tomátelas'],
    meaning: 'Irse de un lugar, muchas veces apurado. «Tomátelas» es la orden: «andate».',
  }),
  ficha({
    id: 'boga',
    term: 'Boga',
    forms: ['boga'],
    meaning: 'Abogado o abogada, dicho de manera informal.',
  }),
  ficha({
    id: 'bocha',
    term: 'Una bocha',
    forms: ['una bocha'],
    meaning: 'Mucho, una gran cantidad de algo. «Una bocha de gente» es mucha gente.',
  }),
  ficha({
    id: 'guita',
    term: 'Guita',
    forms: ['guita'],
    meaning: 'Dinero.',
  }),
  ficha({
    id: 'gauchada',
    term: 'Gauchada',
    forms: ['gauchada', 'gauchadas'],
    meaning: 'Favor que se le hace a alguien con buena voluntad, sin esperar nada a cambio.',
    origin: 'Deriva de «gaucho», el jinete de la llanura rioplatense.',
  }),
  ficha({
    id: 'capo',
    term: 'Capo',
    forms: ['capo', 'capos'],
    meaning: 'Persona que se destaca mucho en lo que hace, la mejor en su actividad.',
    origin: 'Viene del italiano «capo», que significa «jefe» o «cabeza».',
  }),
  ficha({
    id: 'luca',
    term: 'Una luca',
    forms: ['una luca'],
    meaning: 'Mil pesos.',
  }),
  ficha({
    id: 'de-fierro',
    term: 'Ser de fierro',
    forms: ['sos de fierro'],
    meaning: 'Ser un amigo leal, en quien se puede confiar siempre.',
  }),
  ficha({
    id: 'gardel',
    term: 'Ser Gardel',
    forms: ['es gardel', 'sos gardel'],
    meaning: 'Ser el mejor en lo que se hace, destacarse muchísimo.',
    origin:
      'Hace referencia a Carlos Gardel, cantor y compositor de tango, una de las grandes figuras de la música rioplatense.',
  }),
  ficha({
    id: 'de-madera',
    term: 'Ser de madera',
    forms: ['soy de madera', 'sos de madera'],
    meaning: 'Ser muy malo para algo, sobre todo para un deporte.',
  }),
  ficha({
    id: 'tubazo',
    term: 'Pegar un tubazo',
    forms: ['un tubazo'],
    meaning: 'Llamar por teléfono a alguien.',
    origin: 'Deriva de «tubo», nombre popular del teléfono.',
  }),
  ficha({
    id: 'galgos',
    term: 'Tirar los galgos',
    forms: ['los galgos'],
    meaning: 'Coquetear: mostrarle a alguien que nos gusta.',
  }),
  ficha({
    id: 'queruza',
    term: 'De queruza',
    forms: ['de queruza'],
    meaning: 'Hacer algo a escondidas, sin que nadie se dé cuenta.',
  }),
  ficha({
    id: 'correte',
    term: 'Correte',
    forms: ['correte'],
    meaning:
      'Pedido para que alguien se mueva y deje lugar. Entre amigos es común, pero a veces suena brusco.',
  }),
  ficha({
    id: 'mala-leche',
    term: 'Mala leche',
    forms: ['mala leche'],
    meaning: 'Mala intención: se dice de quien actúa para fastidiar o hacer daño a otro.',
  }),
  ficha({
    id: 'remera',
    term: 'Remera',
    forms: ['remera', 'remeras'],
    meaning:
      'Prenda de manga corta que se usa en la parte de arriba del cuerpo. En otros países se la llama camiseta o playera.',
  }),
  ficha({
    id: 'flashear',
    term: 'Flashear',
    forms: ['flashear'],
    meaning:
      'Imaginarse cosas que no son reales, o creer que algo es de una manera cuando no lo es.',
  }),
  ficha({
    id: 'plomero',
    term: 'Plomero',
    region: 'Argentina y otros países',
    forms: ['plomero', 'plomera'],
    meaning:
      'Persona que arregla cañerías, canillas y baños. En otros países se le dice fontanero.',
  }),
  ficha({
    id: 'me-pinta',
    term: 'Me pinta',
    forms: ['me pinta'],
    meaning: 'Tengo ganas de hacer algo, o algo me gusta o me atrae.',
  }),
  ficha({
    id: 'rescatarse',
    term: 'Rescatarse',
    forms: ['rescatate', 'rescatarse'],
    meaning: 'Darse cuenta de cómo son las cosas y actuar con más cuidado y criterio.',
  }),
  ficha({
    id: 'tenerla-clara',
    term: 'Tenerla clara',
    forms: ['la tiene clara', 'la tenés clara', 'tenerla clara'],
    meaning: 'Saber mucho de un tema o manejarse muy bien en algo.',
  }),
  ficha({
    id: 'gorra',
    term: 'Ponerse la gorra',
    forms: ['te pongas la gorra', 'ponerse la gorra', 'se puso la gorra'],
    meaning: 'Querer poner orden de manera autoritaria, cortando el buen clima de un grupo.',
  }),
  ficha({
    id: 'percha',
    term: 'Estar hecho percha',
    forms: ['hecho percha', 'hecha percha'],
    meaning: 'Estar muy cansado, sin energía.',
  }),
  ficha({
    id: 'joya',
    term: 'Joya',
    forms: ['todo joya'],
    meaning:
      'Algo que está muy bien o salió perfecto. «Todo joya» quiere decir que está todo bien.',
  }),
  ficha({
    id: 'zarpado',
    term: 'Zarpado',
    forms: ['zarpado', 'zarpada'],
    meaning:
      'Algo muy bueno o muy intenso. Según el contexto, también se dice de alguien que exagera.',
  }),
  ficha({
    id: 'embole',
    term: 'Embole',
    forms: ['embole'],
    meaning: 'Aburrimiento, o algo que aburre muchísimo.',
  }),
  ficha({
    id: 'colgarse',
    term: 'Colgarse',
    forms: ['me colgué', 'te colgaste', 'se colgó', 'colgarse'],
    meaning: 'Distraerse y perder el hilo de lo que se estaba haciendo o escuchando.',
  }),
  ficha({
    id: 'pecho-frio',
    term: 'Pecho frío',
    forms: ['pecho frío'],
    meaning: 'Se dice de quien no pone pasión ni garra en lo que hace. Es muy usado en el fútbol.',
  }),
  ficha({
    id: 'palo',
    term: 'Un palo',
    forms: ['un palo', 'un palo verde'],
    meaning: 'Un millón de pesos. «Un palo verde» es un millón de dólares.',
  }),
  ficha({
    id: 'gamba',
    term: 'Una gamba',
    forms: ['una gamba'],
    meaning: 'Cien pesos.',
  }),
  ficha({
    id: 'groso',
    term: 'Groso, grosa',
    forms: ['groso', 'grosa'],
    meaning: 'Se dice de alguien que hizo algo muy bueno, o de algo impresionante.',
  }),
  ficha({
    id: 'viejo',
    term: 'Viejo, vieja',
    forms: ['mi vieja', 'mi viejo', 'mis viejos'],
    meaning: 'Forma cariñosa de nombrar al papá y a la mamá.',
  }),
  ficha({
    id: 'posta',
    term: 'Posta',
    forms: ['posta'],
    meaning:
      'Verdad. Se usa para decir que algo es cierto o en serio; «¿posta?» significa «¿en serio?».',
  }),
  ficha({
    id: 'al-palo',
    term: 'Al palo',
    forms: ['al palo'],
    meaning: 'Con muchísima intensidad: a toda velocidad o con toda la energía.',
  }),
  ficha({
    id: 'morfar',
    term: 'Morfar',
    forms: ['morfar', 'morfamos'],
    meaning: 'Comer, dicho de manera informal entre amigos o en familia.',
  }),
  ficha({
    id: 'pandito',
    term: 'Pandito',
    category: 'regional',
    region: 'San Luis',
    forms: ['pandito', 'panditos'],
    meaning: 'Lugar poco profundo.',
  }),
  ficha({
    id: 'choco',
    term: 'Choco',
    category: 'regional',
    region: 'Región por confirmar',
    forms: ['choco'],
    meaning: 'Forma de llamar a un perro.',
  }),
]
