// Every breed in Wikipedia's "List of cat breeds" table, with the traits CatSprite draws.
//
// coat / accent / accent2: colour names from COLORS in CatSprite.vue
// pattern: solid | tabby | classic | spotted | rosette | ticked | shaded | roan
//          | colorpoint | mitted | bicolor | van | tortie | calico
// fur: short | semi | long | rex | wire | hairless
// ears: normal | small | large | tufted | fold | curl
// tail: full | plume | bob | none
// body: normal | slim | cobby | large | dwarf | small
// face: round | flat | wedge
// eyes: green | gold | copper | blue | aqua | hazel | odd

const DEFAULTS = {
  coat: 'grey',
  accent: null,
  accent2: null,
  pattern: 'solid',
  fur: 'short',
  ears: 'normal',
  tail: 'full',
  body: 'normal',
  face: 'round',
  eyes: 'green',
}

function cat(name, traits) {
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return { id, name, ...DEFAULTS, ...traits }
}

export const BREEDS = [
  cat('Abyssinian', { coat: 'ruddy', accent: 'brown', pattern: 'ticked', ears: 'large', body: 'slim', eyes: 'gold' }),
  cat('Aegean', { coat: 'blue', pattern: 'bicolor', fur: 'semi', eyes: 'green' }),
  cat('American Bobtail', { coat: 'tan', accent: 'brown', pattern: 'tabby', fur: 'semi', tail: 'bob', body: 'cobby', eyes: 'gold' }),
  cat('American Curl', { coat: 'silver', accent: 'black', pattern: 'tabby', fur: 'semi', ears: 'curl', eyes: 'green' }),
  cat('American Shorthair', { coat: 'silver', accent: 'black', pattern: 'classic', body: 'cobby', eyes: 'copper' }),
  cat('American Wirehair', { coat: 'red', accent: 'cinnamon', pattern: 'tabby', fur: 'wire', eyes: 'gold' }),
  cat("Aphrodite's Giant", { coat: 'black', pattern: 'bicolor', fur: 'semi', body: 'large', eyes: 'green' }),
  cat('Arabian Mau', { coat: 'tan', accent: 'brown', pattern: 'tabby', ears: 'large', eyes: 'green' }),
  cat('Asian', { coat: 'brown', eyes: 'gold' }),
  cat('Australian Mist', { coat: 'fawn', accent: 'brown', pattern: 'spotted', eyes: 'green' }),
  cat('Balinese', { coat: 'cream', accent: 'seal', pattern: 'colorpoint', fur: 'long', ears: 'large', body: 'slim', face: 'wedge', eyes: 'blue' }),
  cat('Bambino', { coat: 'pink', fur: 'hairless', ears: 'large', body: 'dwarf', eyes: 'aqua' }),
  cat('Bengal', { coat: 'golden', accent: 'brown', pattern: 'rosette', body: 'large', eyes: 'green' }),
  cat('Birman', { coat: 'cream', accent: 'seal', pattern: 'mitted', fur: 'semi', body: 'cobby', eyes: 'blue' }),
  cat('Bombay', { coat: 'black', body: 'cobby', eyes: 'copper' }),
  cat('Brazilian Shorthair', { coat: 'red', pattern: 'bicolor', eyes: 'gold' }),
  cat('British Longhair', { coat: 'blue', fur: 'long', ears: 'small', body: 'cobby', eyes: 'copper' }),
  cat('British Shorthair', { coat: 'blue', ears: 'small', body: 'cobby', eyes: 'copper' }),
  cat('Burmese', { coat: 'brown', body: 'cobby', eyes: 'gold' }),
  cat('Burmilla', { coat: 'silver', accent: 'black', pattern: 'shaded', eyes: 'green' }),
  cat('California Spangled', { coat: 'golden', accent: 'black', pattern: 'spotted', body: 'slim', eyes: 'gold' }),
  cat('Chantilly-Tiffany', { coat: 'chocolate', fur: 'long', eyes: 'gold' }),
  cat('Chartreux', { coat: 'blue', body: 'large', eyes: 'gold' }),
  cat('Chausie', { coat: 'black', accent: 'silver', pattern: 'ticked', ears: 'tufted', body: 'large', eyes: 'gold' }),
  cat('Colorpoint Shorthair', { coat: 'cream', accent: 'red', pattern: 'colorpoint', ears: 'large', body: 'slim', face: 'wedge', eyes: 'blue' }),
  cat('Cornish Rex', { coat: 'cream', fur: 'rex', ears: 'large', body: 'slim', face: 'wedge', eyes: 'gold' }),
  cat('Cymric', { coat: 'black', accent: 'red', pattern: 'tortie', fur: 'long', tail: 'none', body: 'cobby', eyes: 'copper' }),
  cat('Devon Rex', { coat: 'lilac', fur: 'rex', ears: 'large', eyes: 'green' }),
  cat('Donskoy', { coat: 'lilac', fur: 'hairless', ears: 'large', eyes: 'green' }),
  cat('Dragon Li', { coat: 'tan', accent: 'black', pattern: 'tabby', eyes: 'green' }),
  cat('Dwelf', { coat: 'pink', fur: 'hairless', ears: 'curl', body: 'dwarf', eyes: 'gold' }),
  cat('Egyptian Mau', { coat: 'silver', accent: 'black', pattern: 'spotted', body: 'slim', eyes: 'green' }),
  cat('European Shorthair', { coat: 'black', pattern: 'bicolor', eyes: 'gold' }),
  cat('Exotic Shorthair', { coat: 'cream', body: 'cobby', face: 'flat', eyes: 'copper' }),
  cat('Foldex', { coat: 'blue', pattern: 'bicolor', ears: 'fold', body: 'cobby', face: 'flat', eyes: 'copper' }),
  cat('German Rex', { coat: 'black', fur: 'rex', eyes: 'gold' }),
  cat('Havana Brown', { coat: 'chocolate', ears: 'large', face: 'wedge', eyes: 'green' }),
  cat('Highlander', { coat: 'tan', accent: 'brown', pattern: 'spotted', ears: 'curl', tail: 'bob', body: 'large', eyes: 'gold' }),
  cat('Himalayan', { coat: 'cream', accent: 'seal', pattern: 'colorpoint', fur: 'long', body: 'cobby', face: 'flat', eyes: 'blue' }),
  cat('Jianzhou cat', { coat: 'black', accent: 'orange', pattern: 'tortie', eyes: 'gold' }),
  cat('Japanese Bobtail', { coat: 'white', accent: 'red', accent2: 'black', pattern: 'calico', ears: 'large', tail: 'bob', body: 'slim', eyes: 'gold' }),
  cat('Javanese', { coat: 'white', accent: 'lilac', pattern: 'colorpoint', fur: 'long', ears: 'large', body: 'slim', face: 'wedge', eyes: 'blue' }),
  cat('Kanaani', { coat: 'tan', accent: 'chocolate', pattern: 'spotted', ears: 'large', body: 'slim', eyes: 'green' }),
  cat('Karelian Bobtail', { coat: 'silver', accent: 'black', pattern: 'tabby', fur: 'semi', tail: 'bob', eyes: 'green' }),
  cat('Khao Manee', { coat: 'white', body: 'slim', eyes: 'odd' }),
  cat('Kinkalow', { coat: 'red', ears: 'curl', body: 'dwarf', eyes: 'gold' }),
  cat('Korat', { coat: 'blue', pattern: 'shaded', accent: 'silver', eyes: 'green' }),
  cat('Korean Bobtail', { coat: 'red', pattern: 'bicolor', tail: 'bob', eyes: 'gold' }),
  cat('Korn Ja', { coat: 'black', body: 'small', face: 'wedge', eyes: 'gold' }),
  cat('Kurilian Bobtail', { coat: 'tan', accent: 'brown', pattern: 'tabby', fur: 'semi', tail: 'bob', body: 'large', eyes: 'gold' }),
  cat('Lambkin', { coat: 'white', fur: 'rex', body: 'dwarf', eyes: 'blue' }),
  cat('LaPerm', { coat: 'cinnamon', fur: 'rex', eyes: 'gold' }),
  cat('Lykoi', { coat: 'black', accent: 'white', pattern: 'roan', eyes: 'gold' }),
  cat('Maine Coon', { coat: 'tan', accent: 'brown', pattern: 'classic', fur: 'long', ears: 'tufted', tail: 'plume', body: 'large', eyes: 'green' }),
  cat('Manx', { coat: 'red', accent: 'cinnamon', pattern: 'tabby', tail: 'none', body: 'cobby', eyes: 'copper' }),
  cat('Mekong Bobtail', { coat: 'cream', accent: 'seal', pattern: 'colorpoint', tail: 'bob', eyes: 'blue' }),
  cat('Minskin', { coat: 'fawn', fur: 'hairless', ears: 'large', body: 'dwarf', eyes: 'gold' }),
  cat('Minuet', { coat: 'cream', fur: 'long', body: 'dwarf', face: 'flat', eyes: 'copper' }),
  cat('Munchkin', { coat: 'tan', accent: 'brown', pattern: 'tabby', body: 'dwarf', eyes: 'gold' }),
  cat('Nebelung', { coat: 'blue', fur: 'long', body: 'slim', eyes: 'green' }),
  cat('Neva Masquerade', { coat: 'cream', accent: 'blue', pattern: 'colorpoint', fur: 'long', ears: 'tufted', body: 'large', eyes: 'blue' }),
  cat('Norwegian Forest cat', { coat: 'black', pattern: 'bicolor', fur: 'long', ears: 'tufted', tail: 'plume', body: 'large', eyes: 'green' }),
  cat('Ocicat', { coat: 'tan', accent: 'chocolate', pattern: 'spotted', body: 'large', eyes: 'gold' }),
  cat('Ojos Azules', { coat: 'black', accent: 'orange', pattern: 'tortie', eyes: 'blue' }),
  cat('Oriental Bicolour', { coat: 'black', pattern: 'bicolor', ears: 'large', body: 'slim', face: 'wedge', eyes: 'green' }),
  cat('Oriental Longhair', { coat: 'red', fur: 'long', ears: 'large', body: 'slim', face: 'wedge', eyes: 'green' }),
  cat('Oriental Shorthair', { coat: 'cinnamon', ears: 'large', body: 'slim', face: 'wedge', eyes: 'green' }),
  cat('Persian (modern)', { coat: 'white', fur: 'long', ears: 'small', body: 'cobby', face: 'flat', eyes: 'copper' }),
  cat('Persian (traditional)', { coat: 'silver', accent: 'black', pattern: 'shaded', fur: 'long', ears: 'small', body: 'cobby', eyes: 'green' }),
  cat('Peterbald', { coat: 'chocolate', fur: 'hairless', ears: 'large', body: 'slim', face: 'wedge', eyes: 'green' }),
  cat('Pixie-bob', { coat: 'tan', accent: 'black', pattern: 'spotted', ears: 'tufted', tail: 'bob', body: 'large', eyes: 'gold' }),
  cat('Ragamuffin', { coat: 'red', pattern: 'bicolor', fur: 'long', body: 'cobby', eyes: 'green' }),
  cat('Ragdoll', { coat: 'cream', accent: 'blue', pattern: 'mitted', fur: 'long', body: 'large', eyes: 'blue' }),
  cat('Raas', { coat: 'blue', ears: 'small', body: 'small', eyes: 'gold' }),
  cat('Russian Blue', { coat: 'blue', ears: 'large', body: 'slim', eyes: 'green' }),
  cat('Russian White, Black and Tabby', { coat: 'white', ears: 'large', body: 'slim', eyes: 'green' }),
  cat('Sam Sawet', { coat: 'seal', body: 'slim', eyes: 'gold' }),
  cat('Savannah', { coat: 'golden', accent: 'black', pattern: 'spotted', ears: 'large', body: 'large', eyes: 'gold' }),
  cat('Scottish Fold', { coat: 'silver', accent: 'black', pattern: 'classic', ears: 'fold', body: 'cobby', eyes: 'copper' }),
  cat('Selkirk Rex', { coat: 'blue', pattern: 'bicolor', fur: 'rex', body: 'large', eyes: 'copper' }),
  cat('Serengeti', { coat: 'golden', accent: 'black', pattern: 'spotted', ears: 'large', body: 'slim', eyes: 'gold' }),
  cat('Siamese (modern)', { coat: 'cream', accent: 'seal', pattern: 'colorpoint', ears: 'large', body: 'slim', face: 'wedge', eyes: 'blue' }),
  cat('Siberian', { coat: 'silver', accent: 'black', pattern: 'tabby', fur: 'long', ears: 'tufted', tail: 'plume', body: 'large', eyes: 'gold' }),
  cat('Singapura', { coat: 'fawn', accent: 'brown', pattern: 'ticked', ears: 'large', body: 'small', eyes: 'hazel' }),
  cat('Snowshoe', { coat: 'cream', accent: 'seal', pattern: 'mitted', eyes: 'blue' }),
  cat('Sokoke', { coat: 'tan', accent: 'black', pattern: 'classic', body: 'slim', eyes: 'hazel' }),
  cat('Somali', { coat: 'ruddy', accent: 'brown', pattern: 'ticked', fur: 'long', tail: 'plume', eyes: 'gold' }),
  cat('Sphynx', { coat: 'pink', fur: 'hairless', ears: 'large', eyes: 'green' }),
  cat('Suphalak', { coat: 'ruddy', eyes: 'gold' }),
  cat('Thai', { coat: 'cream', accent: 'seal', pattern: 'colorpoint', eyes: 'blue' }),
  cat('Thai Lilac, Thai Blue Point and Thai Lilac Point', { coat: 'lilac', eyes: 'gold' }),
  cat('Tiffanie', { coat: 'silver', accent: 'black', pattern: 'shaded', fur: 'semi', eyes: 'green' }),
  cat('Tonkinese', { coat: 'fawn', accent: 'chocolate', pattern: 'colorpoint', eyes: 'aqua' }),
  cat('Toybob', { coat: 'cream', accent: 'seal', pattern: 'colorpoint', tail: 'bob', body: 'dwarf', eyes: 'blue' }),
  cat('Toyger', { coat: 'orange', accent: 'black', pattern: 'tabby', body: 'large', eyes: 'gold' }),
  cat('Turkish Angora', { coat: 'white', fur: 'semi', tail: 'plume', body: 'slim', eyes: 'odd' }),
  cat('Turkish Van', { coat: 'white', accent: 'red', pattern: 'van', fur: 'semi', eyes: 'gold' }),
  cat('Van cat', { coat: 'white', fur: 'long', eyes: 'blue' }),
  cat('Ukrainian Levkoy', { coat: 'grey', fur: 'hairless', ears: 'fold', body: 'slim', eyes: 'green' }),
  cat('York Chocolate', { coat: 'chocolate', pattern: 'bicolor', fur: 'long', eyes: 'gold' }),
]

export const BREED_BY_ID = Object.fromEntries(BREEDS.map((b) => [b.id, b]))

export function randomBreed() {
  return BREEDS[Math.floor(Math.random() * BREEDS.length)]
}
