const PROVINCES = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Ciudad Autónoma de Buenos Aires',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
]

export const REGION_OPTIONS = [
  { value: 'Argentina', label: 'Todo el país' },
  ...PROVINCES.map((name) => ({ value: name, label: name })),
  { value: 'Región por confirmar', label: 'No sé de dónde es' },
]

export const REGION_VALUES = REGION_OPTIONS.map((option) => option.value)
