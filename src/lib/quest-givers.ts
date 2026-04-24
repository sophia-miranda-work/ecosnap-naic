export type QuestGiver = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  accent: string; // tailwind-friendly bg utility for the bubble tail
  greetings: string[];
  bio: string;
  habitat: string;
  catchphrase: string;
};

/**
 * Small cast of woodland quest-givers. One is picked per day (deterministic
 * by date) so the same character greets the explorer all day.
 */
export const QUEST_GIVERS: QuestGiver[] = [
  {
    id: "willow",
    name: "Willow",
    role: "the Hedge Witch",
    avatar: "🧙‍♀️",
    accent: "bg-primary-foreground",
    greetings: [
      "Ah, there you are, dear explorer.",
      "The wind whispered you'd come today.",
      "I brewed you a quest with the morning dew.",
      "My broom and I have been waiting.",
    ],
    bio: "Willow keeps a tidy cottage at the edge of the bramble. She brews tea from things most people step over, and believes every walk is a small spell waiting to be cast.",
    habitat: "Hedgerows & herb gardens",
    catchphrase: "Bring me a wonder; I'll trade you a story.",
  },
  {
    id: "professor-hoot",
    name: "Professor Hoot",
    role: "the Owl Sage",
    avatar: "🦉",
    accent: "bg-primary-foreground",
    greetings: [
      "Ahem. Today's field assignment, if you please.",
      "Knowledge favors the curious foot.",
      "I have a riddle wrapped in a walk for you.",
      "Open your notebook — class is in session.",
    ],
    bio: "A retired lecturer of Applied Wandering. Professor Hoot grades on curiosity, not correctness, and keeps detailed notes on every cloud he's ever met.",
    habitat: "Old oaks & quiet libraries",
    catchphrase: "Look twice. Then look once more.",
  },
  {
    id: "pip",
    name: "Pip",
    role: "the Fox Scout",
    avatar: "🦊",
    accent: "bg-primary-foreground",
    greetings: [
      "Psst! Quick — before the trail wakes up.",
      "I sniffed out something worth finding.",
      "Tail high, eyes sharp, off we go!",
      "Bet you can't spot it before I would.",
    ],
    bio: "Fastest paws in the meadow, loudest grin in the woods. Pip scouts trails before sunrise and leaves tiny pawprints next to anything worth seeing.",
    habitat: "Tall grass & forest edges",
    catchphrase: "Race you to the next bend!",
  },
  {
    id: "mossback",
    name: "Mossback",
    role: "the Old Toad",
    avatar: "🐸",
    accent: "bg-primary-foreground",
    greetings: [
      "Slow down. Look closer. There — yes.",
      "The pond and I have a request.",
      "Patience is half the quest, friend.",
      "Hop along when you're ready.",
    ],
    bio: "Mossback has sat on the same lily pad for longer than anyone remembers. He measures time in ripples and considers a good blink to be a full conversation.",
    habitat: "Ponds & damp stones",
    catchphrase: "Stillness is its own adventure.",
  },
  {
    id: "clover",
    name: "Clover",
    role: "the Meadow Bunny",
    avatar: "🐰",
    accent: "bg-primary-foreground",
    greetings: [
      "Good morning, good morning, good morning!",
      "I found the loveliest thing — go see!",
      "Hop hop! Adventure's calling.",
      "Bring me back a story, won't you?",
    ],
    bio: "Clover greets every dawn like it's her birthday. She collects four-leafed clovers, tiny pebbles, and even tinier rumors from the wildflowers.",
    habitat: "Sunny meadows & garden paths",
    catchphrase: "Today's the loveliest day yet!",
  },
];

/** Deterministic daily pick so the giver is stable across reloads. */
export function pickDailyGiver(date = new Date()): QuestGiver {
  const seed =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return QUEST_GIVERS[seed % QUEST_GIVERS.length];
}

/**
 * Per-quest intro lines, written in each character's voice.
 * Outer key = quest title, inner key = quest-giver id.
 * `getQuestIntro(quest, giver)` falls back gracefully if a line is missing.
 */
export const QUEST_INTROS: Record<string, Partial<Record<string, string>>> = {
  "Find a flower with 5 petals": {
    willow: "Five petals, five little wishes — bring me one and we'll spend them well.",
    "professor-hoot": "Five-fold symmetry. A small miracle. Document it, please.",
    pip: "Bet you a pinecone you can't find one before lunch!",
    mossback: "Count slowly. One… two… all the way to five.",
    clover: "Five whole petals?! Imagine the luck!",
  },
  "Spot a uniquely shaped leaf": {
    willow: "Ovals are for ordinary days. Find me a leaf shaped like a secret.",
    "professor-hoot": "Catalogue any leaf that defies its species. Sketch the outline.",
    pip: "Hearts, stars, claws — bring me the weirdest one!",
    mossback: "A leaf with character. Like an old friend.",
    clover: "Find the prettiest, oddest leaf in the whole meadow!",
  },
  "Spot a yellow bird": {
    willow: "Listen for a song the color of sunshine. Then look up.",
    "professor-hoot": "Yellow plumage. Note the call before you note the colour.",
    pip: "Yellow flash up high — quick, before it bolts!",
    mossback: "Sit. Wait. The yellow one always returns.",
    clover: "A sunshine bird! Oh, please bring me a glimpse!",
  },
  "Find a fallen feather": {
    willow: "A feather is a letter from the sky. Fetch one, would you?",
    "professor-hoot": "Specimen request: one fallen feather. Handle with care.",
    pip: "Feather hunt! First one back wins a cloudberry.",
    mossback: "The wind drops them where it pleases. Look low.",
    clover: "A soft little feather for my collection — please?",
  },
  "Discover a mushroom": {
    willow: "Under the damp and the shade, the little umbrellas wait.",
    "professor-hoot": "Identify a fungus. Do not, under any circumstances, taste it.",
    pip: "Mushroom mission! The frillier the better.",
    mossback: "By the old log, after the rain. They like it there.",
    clover: "A tiny mushroom hat for a tiny mushroom guest!",
  },
  "Hear three different birdsongs": {
    willow: "Three songs, three small spells — gather them on the breeze.",
    "professor-hoot": "An auditory transect. Three distinct calls, please.",
    pip: "Ears up! Three tunes, no repeats — go!",
    mossback: "Close your eyes. The pond will help you count.",
    clover: "A whole little choir for me to imagine!",
  },
  "Find something perfectly round": {
    willow: "Round things hold the most magic. A pebble, a berry — your choice.",
    "professor-hoot": "Document one naturally spherical object. Diameter optional.",
    pip: "Round means rolly! Find a rolly one!",
    mossback: "The river makes them. Be patient with your looking.",
    clover: "A perfect circle! Like a tiny moon!",
  },
  "Spot a spider's web": {
    willow: "A web is a poem the morning forgot to sweep away.",
    "professor-hoot": "Locate one orb-weaver's lattice. Do not disturb the architect.",
    pip: "Sneaky silk traps — find one before it finds you!",
    mossback: "Between two reeds. They love the in-between places.",
    clover: "Sparkly dewy webs are the prettiest little doilies!",
  },
  "Touch the bark of three different trees": {
    willow: "Each tree has a different handshake. Greet three of them for me.",
    "professor-hoot": "Tactile field study. Three trunks, three textures, take notes.",
    pip: "Tree tag! Tap three and zoom back!",
    mossback: "Slow palms. Old friends. Three is a fine number.",
    clover: "Hug them while you're at it — they like that!",
  },
  "Find a pinecone": {
    willow: "Pinecones keep tiny secrets in their scales. Bring me one.",
    "professor-hoot": "Conifer cone, intact preferred. A simple yet noble specimen.",
    pip: "Pinecone! Pinecone! Best one wins!",
    mossback: "Beneath the tall, quiet ones. Look down.",
    clover: "A little wooden flower! Aren't they darling?",
  },
  "Smell three different plants": {
    willow: "Noses are wands too. Sniff three green things and report back.",
    "professor-hoot": "Olfactory survey. Mint, pine, anything pungent — three samples.",
    pip: "Sniff sniff sniff! Bonus points for stinky!",
    mossback: "Crush a leaf gently. The good ones whisper back.",
    clover: "Imagine the bouquet! Tell me which was loveliest.",
  },
  "Spot a butterfly or moth": {
    willow: "A flutter on the wind — catch one only with your eyes.",
    "professor-hoot": "Lepidoptera sighting requested. Note wing pattern if able.",
    pip: "Wings on patrol! Spot one and don't scare it!",
    mossback: "Sit still long enough and one will land near you.",
    clover: "A butterfly! Oh, a butterfly! Please find me one!",
  },
  "Find a stone you'd keep": {
    willow: "The right stone hums when you hold it. Trust your fingers.",
    "professor-hoot": "Select one geologically interesting specimen. Pocket-sized.",
    pip: "Treasure rock! Shiniest one wins!",
    mossback: "It will pick you, not the other way around.",
    clover: "A pet pebble! Give it a name, won't you?",
  },
  "Watch the clouds for one minute": {
    willow: "Read the sky like tea leaves. Tell me what it said.",
    "professor-hoot": "Sixty seconds of cumulus contemplation. Begin.",
    pip: "One whole minute?! Okay, okay — clouds, go!",
    mossback: "A minute is barely a blink. Take two if you'd like.",
    clover: "I love clouds! Find me a sheep-shaped one!",
  },
  "Spot something blue in nature": {
    willow: "Blue is shy in the woods. It hides in petals and wings.",
    "professor-hoot": "Blue pigment in flora or fauna. Surprisingly rare.",
    pip: "Blue thing! Blue thing! Don't say the sky!",
    mossback: "Look at the small things. Blue lives there.",
    clover: "A little blue surprise — what a treasure!",
  },

  // ── Sounds & senses ────────────────────────────────────────────────────
  "Listen to the wind in the leaves": {
    willow: "The trees are gossiping. Lend them your ears.",
    "professor-hoot": "Aeolian acoustics. Stand still. Note the rhythm.",
    pip: "Shhhh — leaves are whispering trail rumors!",
    mossback: "A long, slow sound. My favorite kind.",
    clover: "It sounds like the meadow is humming!",
  },
  "Find a smell that reminds you of childhood": {
    willow: "Memory hides in scent. Sniff carefully.",
    "professor-hoot": "Olfactory time travel. Document the trigger.",
    pip: "Sniff sniff! What does little-you smell?",
    mossback: "Old wet leaves do it for me. Try yours.",
    clover: "Like jam? Like grass? Tell me everything!",
  },
  "Listen for water — a stream, a drip, a wave": {
    willow: "Water tells the oldest stories. Eavesdrop a while.",
    "professor-hoot": "Hydrological audio. Source identification, please.",
    pip: "Trickly splashy sounds — find one!",
    mossback: "I know a good drip. The pond knows three.",
    clover: "A bubbly little brook would be lovely!",
  },
  "Touch something cold in nature": {
    willow: "Cold things hold the morning's secrets. Try a stone.",
    "professor-hoot": "Tactile thermometry. Frost, metal, deep stone — choose.",
    pip: "Brrr-touch! Quick, before it warms up!",
    mossback: "A river rock at dawn. Unbeatable.",
    clover: "Then warm it in your pocket like a tiny secret!",
  },
  "Find something soft to touch (a moss, a petal)": {
    willow: "Soft things are nature's small kindnesses.",
    "professor-hoot": "Document the texture. Velvety? Downy? Spongy?",
    pip: "Soft thing alert! Pet it gently!",
    mossback: "Moss. Always moss. Trust me.",
    clover: "Bunny-soft is best, but petal-soft will do!",
  },

  // ── Sky & weather ──────────────────────────────────────────────────────
  "Spot a cloud shaped like an animal": {
    willow: "The sky paints riddles. Read one for me.",
    "professor-hoot": "Pareidolia field exercise. Sketch the suspect.",
    pip: "Sky zoo! What's up there today?!",
    mossback: "I once saw a toad. Took an hour to drift past.",
    clover: "A cloud-bunny? Oh please let it be a bunny!",
  },
  "Find the brightest spot of sunlight": {
    willow: "Stand in it for a moment. That's a spell, you know.",
    "professor-hoot": "Identify peak insolation along your path.",
    pip: "Sun-pounce! Stand right in it!",
    mossback: "A warm patch is a small holiday.",
    clover: "Soak it up! Tell me how it felt!",
  },
  "Watch a sunrise or sunset": {
    willow: "The horizon is a doorway. Watch it open.",
    "professor-hoot": "Diurnal transition observation. No looking through optics.",
    pip: "Pink-sky time! Don't blink!",
    mossback: "Worth every minute, every time.",
    clover: "Imagine the colors! Or, you know, just see them!",
  },
  "Spot the moon in daytime": {
    willow: "She visits when she's curious. Wave back.",
    "professor-hoot": "Lunar daylight observation. Note the phase.",
    pip: "Daytime moon! Sneaky little thing!",
    mossback: "She likes mornings. I like her.",
    clover: "Hi moon! Bye moon! Good moon!",
  },
  "Notice the temperature on your skin": {
    willow: "Your skin is the oldest weather instrument.",
    "professor-hoot": "Subjective thermoreception. Just notice. No tools.",
    pip: "Hot? Cold? Breezy? Tell me quick!",
    mossback: "Sit. Notice. That's the whole assignment.",
    clover: "Like a hug from the air, isn't it?",
  },
  "Stand still for one whole minute outside": {
    willow: "Be a tree for sixty seconds. The forest will visit.",
    "professor-hoot": "Stillness study. No fidgeting. The clock is honest.",
    pip: "A WHOLE minute?! Okay, okay — go!",
    mossback: "Finally, an assignment in my speciality.",
    clover: "You'll hear so much! I promise!",
  },

  // ── Plants & ground ────────────────────────────────────────────────────
  "Find three different shades of green": {
    willow: "Green is a rainbow pretending to be one color.",
    "professor-hoot": "Document a chromatic gradient. Pale, mid, deep.",
    pip: "Green hunt! No cheating, the grass is just one!",
    mossback: "Moss alone has seven. I've counted.",
    clover: "Lime! Mint! Forest! All so pretty!",
  },
  "Find a plant taller than you": {
    willow: "Look up. Greet the giants politely.",
    "professor-hoot": "Identify a specimen exceeding your stature.",
    pip: "Big plant! Tall plant! Wow plant!",
    mossback: "They were saplings once. Imagine that.",
    clover: "A giant friend! Did you say hi?",
  },
  "Find a plant smaller than your fingernail": {
    willow: "The tiniest things hold the largest spells.",
    "professor-hoot": "Microflora observation. Crouch, do not crush.",
    pip: "Tiny tiny TINY plant! Found it?!",
    mossback: "Look between the cracks. Whole worlds there.",
    clover: "A miniature meadow! How adorable!",
  },
  "Find a fallen branch shaped like a letter": {
    willow: "The forest writes notes. Find one addressed to you.",
    "professor-hoot": "Arboreal calligraphy. A 'Y' is most common.",
    pip: "Letter-stick! What does it spell?!",
    mossback: "I once found a 'Q'. Kept it for years.",
    clover: "Your initial would be the loveliest find!",
  },
  "Smell a flower without picking it": {
    willow: "Lean in gently. It will lean back.",
    "professor-hoot": "Non-destructive olfactory sampling. Excellent ethics.",
    pip: "Flower sniff! Don't sneeze on it!",
    mossback: "Manners matter, even with petals.",
    clover: "Just a little hello-sniff for the flower!",
  },
  "Find a seed (acorn, helicopter, dandelion)": {
    willow: "Seeds are wishes with directions. Pocket one.",
    "professor-hoot": "Propagule collection. One specimen, please.",
    pip: "Seed scout! Spinny ones win bonus points!",
    mossback: "All this, from such a small thing.",
    clover: "Make a wish if it's a dandelion!",
  },
  "Spot a flower you don't know the name of": {
    willow: "Mystery flowers are the best kind. We'll name it later.",
    "professor-hoot": "Unidentified species. Sketch first, classify later.",
    pip: "Stranger-bloom! What should we call it?!",
    mossback: "Names come slow. Looking comes first.",
    clover: "Let's call it a 'thingaflower' for now!",
  },
  "Find ground covered in moss or lichen": {
    willow: "A moss carpet is an invitation. Kneel a moment.",
    "professor-hoot": "Cryptogam survey. Note color and texture.",
    pip: "Squishy ground! Best ground!",
    mossback: "My living room. Help yourself.",
    clover: "Nature's softest little blanket!",
  },

  // ── Animals & insects ──────────────────────────────────────────────────
  "Spot an ant carrying something": {
    willow: "A small worker on a great errand. Salute it.",
    "professor-hoot": "Formicid load study. Note the cargo.",
    pip: "Ant patrol! What did it nab?!",
    mossback: "Steady, steady. The ant knows.",
    clover: "Such a hard-working tiny friend!",
  },
  "Spot a bee on a flower": {
    willow: "A bee at work is a small magic happening.",
    "professor-hoot": "Pollination event. Observe; do not disturb.",
    pip: "Buzzy buddy! Bzzzzz!",
    mossback: "Both of them, busy and patient. A good pair.",
    clover: "Thank you bee! Bring honey!",
  },
  "Spot a snail or slug trail": {
    willow: "Silver writing on the path. The slowest secret.",
    "professor-hoot": "Mucus trail evidence. Direction of travel?",
    pip: "Slime road! Yuck! Cool!",
    mossback: "My dear cousin. We share opinions on speed.",
    clover: "A glittery little path — magical!",
  },
  "Hear an insect (cricket, cicada, buzz)": {
    willow: "The hum of small lives. Listen with both ears.",
    "professor-hoot": "Entomological audio. Pitch and tempo, please.",
    pip: "Bug song! What's it singing?!",
    mossback: "The crickets and I have an understanding.",
    clover: "A tiny bug concert! Just for you!",
  },
  "Spot a worm or beetle on the ground": {
    willow: "Soil keepers, doing quiet work.",
    "professor-hoot": "Detritivore sighting. Carefully replace any rocks.",
    pip: "Wriggle wriggle! Found one?!",
    mossback: "The ground works hard. So do they.",
    clover: "A little ground friend! Wave hello!",
  },
  "Watch a bird in flight for 10 seconds": {
    willow: "Follow it with your eyes, not your feet.",
    "professor-hoot": "Avian flight study. Glide vs flap ratio?",
    pip: "Fly bird, fly! Don't lose it!",
    mossback: "Up there, life is faster. Down here, deeper.",
    clover: "Imagine the view it has! Lucky bird!",
  },
  "Spot a squirrel or rodent": {
    willow: "Quick little neighbors. Be quick to look.",
    "professor-hoot": "Sciurid sighting. Note tail position.",
    pip: "Squirrel! No no — don't chase! Just LOOK!",
    mossback: "Always somewhere to be. Always.",
    clover: "Bushy-tail buddy! Eee!",
  },

  // ── Numbers & shapes ───────────────────────────────────────────────────
  "Count five birds in one place": {
    willow: "Five wings, five wishes. Tally them on the wind.",
    "professor-hoot": "Population census. Five, exactly. No double-counting.",
    pip: "Bird count! One two three — keep going!",
    mossback: "The pond holds five most days. Ducks count.",
    clover: "A whole bird family! How lovely!",
  },
  "Find something heart-shaped in nature": {
    willow: "Hearts grow on stems if you look kindly.",
    "professor-hoot": "Cordate morphology. Leaves are likeliest.",
    pip: "Heart hunt! Bonus if it's tiny!",
    mossback: "A leaf, a stone — even a ripple, sometimes.",
    clover: "Awww, nature is in love with you!",
  },
  "Find a perfect spiral (shell, fern, flower)": {
    willow: "Spirals are how the world keeps its balance.",
    "professor-hoot": "Logarithmic curves abound. Find one.",
    pip: "Swirly thing! Round and round!",
    mossback: "Slow growing. Worth the wait.",
    clover: "Like a tiny galaxy in your hand!",
  },
  "Find a stick exactly as long as your arm": {
    willow: "A measuring wand. Carry it with intent.",
    "professor-hoot": "Anthropometric tool. Approximation accepted.",
    pip: "Stick sword! On guard!",
    mossback: "A walking stick is a gentle ally.",
    clover: "Twin-stick best friend!",
  },
  "Spot a symmetric leaf or wing": {
    willow: "Symmetry is nature whispering 'on purpose'.",
    "professor-hoot": "Bilateral symmetry sighting. Sketch the axis.",
    pip: "Match-y! Mirror-y! Cool!",
    mossback: "Even when imperfect, beautiful.",
    clover: "So neat and tidy and pretty!",
  },

  // ── Colors ─────────────────────────────────────────────────────────────
  "Find something red in nature": {
    willow: "Red is the loud color. It will find you first.",
    "professor-hoot": "Carotenoid or anthocyanin? Either counts.",
    pip: "Red thing! Berry? Bug? GO!",
    mossback: "A ripe berry, perhaps. Look low.",
    clover: "Like a tiny shout in the green!",
  },
  "Find something purple in nature": {
    willow: "Purple is rarely loud. Go quietly.",
    "professor-hoot": "Note the precise hue. Magenta is not violet.",
    pip: "Purple patrol! Bonus if it's flowers!",
    mossback: "An iris by the pond, if you're lucky.",
    clover: "Royal little blooms!",
  },
  "Find something white in nature": {
    willow: "White is borrowed from the moon. Find some moonlight.",
    "professor-hoot": "Reflectance maxima. Petals, pebbles, feathers.",
    pip: "Bright thing! Eye-catcher!",
    mossback: "A daisy will do. Always reliable.",
    clover: "Pure as a fresh cloud!",
  },
  "Spot a rainbow of mushrooms or bark colors": {
    willow: "The forest hides its rainbow on the ground.",
    "professor-hoot": "Mycological palette. Document at least three.",
    pip: "Rainbow scavenge! All the colors!",
    mossback: "Look at three trees in a row. You'll see.",
    clover: "A whole rainbow on the path!",
  },

  // ── Reflection & rituals ───────────────────────────────────────────────
  "Take three deep breaths outside": {
    willow: "Inhale the green. Exhale the gray. Repeat thrice.",
    "professor-hoot": "Pulmonary calibration. Slow and deep, please.",
    pip: "Big breath! Bigger! BIGGEST!",
    mossback: "The way I greet each morning.",
    clover: "Smell the loveliness in!",
  },
  "Compliment a tree out loud": {
    willow: "Trees love a kind word. Whisper it close.",
    "professor-hoot": "Verbal arboreal appreciation. They listen, in a way.",
    pip: "Tree compliment! Don't be shy!",
    mossback: "I once said 'good bark, friend' and meant it.",
    clover: "Tell it it's the prettiest tree on the block!",
  },
  "Wave at a stranger or pet a friendly dog": {
    willow: "Kindness is a small spell with no cost.",
    "professor-hoot": "Social field trial. Smile counts as 50%.",
    pip: "Wave wave wave! Tail wag bonus!",
    mossback: "A kind nod will do, if you prefer.",
    clover: "EEEE puppies! Be polite though!",
  },
  "Pick up one piece of litter": {
    willow: "A small kindness to the woods. They remember.",
    "professor-hoot": "Anthropogenic debris removal. Use a glove if able.",
    pip: "Trash grab! You're a hero!",
    mossback: "The pond and I will thank you.",
    clover: "What a kind little deed!",
  },
  "Find a quiet bench or rock to sit on": {
    willow: "Sit. The world will catch up with you.",
    "professor-hoot": "Adopt a stationary observation post.",
    pip: "Pit stop! Five seconds! Ok, maybe ten!",
    mossback: "Now you understand.",
    clover: "A little throne for an explorer!",
  },
  "Find an opening in the trees and look up": {
    willow: "The sky drops in through every gap. Catch some.",
    "professor-hoot": "Canopy aperture observation. Note cloud cover.",
    pip: "Sky window! Stand right under it!",
    mossback: "An old habit. A good one.",
    clover: "Like nature is showing you a painting!",
  },

  // ── Seasonal / weather quests ──────────────────────────────────────────
  "Find a puddle and look at the reflection": {
    willow: "A puddle is a portable mirror. What does it show?",
    "professor-hoot": "Hydrologic optics. Sky, branches, your nose.",
    pip: "Reflection! Don't splash yet!",
    mossback: "Once you're done, then splash.",
    clover: "Two skies for the price of one!",
  },
  "Catch a snowflake or raindrop on your hand": {
    willow: "Each one is a tiny letter from the clouds.",
    "professor-hoot": "Precipitation specimen. Brief, but valid.",
    pip: "Catch! Catch! Don't let it melt!",
    mossback: "The pond gathers them. So can you.",
    clover: "A little kiss from the sky!",
  },
  "Spot a patch of frost or dew": {
    willow: "The morning paints in silver. Find a brushstroke.",
    "professor-hoot": "Condensation event. Best at dawn.",
    pip: "Sparkle ground! Quick before it dries!",
    mossback: "I do my best thinking in dew.",
    clover: "Like the grass got bedazzled!",
  },
  "Find seeds blowing in the wind": {
    willow: "Tiny travelers. Wave them off properly.",
    "professor-hoot": "Anemochory in action. Document the carrier.",
    pip: "Floaty seeds! Catch one if you can!",
    mossback: "On their way to becoming something.",
    clover: "Make a wish for each one!",
  },
  "Find a tree with peeling or interesting bark": {
    willow: "Bark is a tree's diary. Read a page.",
    "professor-hoot": "Phellem morphology. Sketch the pattern.",
    pip: "Crinkly tree! Cool tree!",
    mossback: "Old, slow stories on every trunk.",
    clover: "Like nature's wallpaper!",
  },
  "Spot two birds interacting": {
    willow: "A small drama in the branches. Stay for the act.",
    "professor-hoot": "Inter-individual avian behaviour. Take notes.",
    pip: "Bird drama! Who's winning?!",
    mossback: "Even up there, they have lives.",
    clover: "Awww are they friends? I bet they are!",
  },
  "Find a place where you can hear nothing man-made": {
    willow: "Find the silence. It is rarer than gold.",
    "professor-hoot": "Locate an acoustically pristine micro-habitat.",
    pip: "Quiet zone! Shhh… still!",
    mossback: "Now you've found the real outdoors.",
    clover: "Nature's own little cathedral!",
  },
};

/** Per-giver line for a given quest, with safe fallbacks. */
export function getQuestIntro(questTitle: string, giverId: string): string | undefined {
  const byGiver = QUEST_INTROS[questTitle];
  if (!byGiver) return undefined;
  return byGiver[giverId] ?? Object.values(byGiver)[0];
}

export function pickGreeting(giver: QuestGiver, date = new Date()): string {
  const seed =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return giver.greetings[seed % giver.greetings.length];
}

export function getGiverById(id: string | null | undefined): QuestGiver | undefined {
  if (!id) return undefined;
  return QUEST_GIVERS.find((g) => g.id === id);
}
