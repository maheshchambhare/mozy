import type { Region } from './places';

/** First names for dummy race names, lower-case like the app's race names (CONTRACT.md §3: 2–16 chars). */
export const namePools: Record<Region, string[]> = {
  southAsia: ['aarav', 'vivaan', 'aditya', 'arjun', 'sai', 'reyansh', 'ishaan', 'rohan', 'kabir', 'dev', 'rahul', 'amit', 'vikram', 'nikhil', 'karan',
    'siddharth', 'aniket', 'priya', 'riya', 'ananya', 'diya', 'isha', 'saanvi', 'aditi', 'kavya', 'meera', 'neha', 'pooja', 'sneha', 'tanvi', 'shreya',
    'nisha', 'anjali', 'kiran', 'lakshmi', 'divya', 'ayesha', 'hassan', 'imran', 'bilal', 'zainab', 'sana', 'farhan', 'nadia', 'tahmid', 'rafi',
    'nuwan', 'kasun', 'sita', 'bishal', 'prakash', 'omkar', 'tejas', 'harsh', 'yash', 'manav', 'arya', 'ira', 'myra', 'papa', 'mummy', 'nani', 'dadi'],
  eastAsia: ['wei', 'li', 'ming', 'jun', 'hao', 'lin', 'yan', 'xin'],
  korea: ['minjun', 'seojun', 'jiwoo', 'hyun', 'jisoo', 'yuna', 'minji', 'seoyeon', 'doyun', 'haneul', 'taeyang', 'sora', 'jimin', 'eunji', 'woojin'],
  japan: ['haruto', 'yuto', 'sota', 'riku', 'kai', 'ren', 'yui', 'hina', 'aoi', 'sakura', 'mei', 'rin', 'yuki', 'kenta', 'takumi', 'emi', 'nao', 'hiro'],
  seAsia: ['putri', 'budi', 'agus', 'dewi', 'sari', 'rizky', 'nguyen', 'linh', 'minh', 'thao', 'anh', 'somchai', 'nok', 'ploy', 'arif', 'aisyah',
    'mark', 'joy', 'angel', 'paolo', 'bea', 'jericho', 'lovely', 'nurul', 'hafiz', 'mei', 'wei', 'kim', 'tran', 'fitri'],
  anglo: ['james', 'olivia', 'liam', 'emma', 'noah', 'ava', 'mia', 'jack', 'grace', 'leo', 'chloe', 'ethan', 'sophie', 'lucas', 'ella', 'max', 'zoe',
    'oscar', 'ruby', 'sam', 'maya', 'theo', 'lily', 'harper', 'owen', 'nora', 'eli', 'jade', 'finn', 'isla', 'mason', 'aria', 'kate', 'ben', 'dad',
    'mom', 'grandma', 'coach.k', 'tess', 'jo'],
  westEurope: ['lena', 'felix', 'paul', 'lea', 'jonas', 'marie', 'emil', 'clara', 'louis', 'chloe', 'hugo', 'camille', 'lucas', 'ines', 'luca',
    'giulia', 'marco', 'sofia', 'matteo', 'alba', 'pablo', 'lucia', 'martin', 'sara', 'joao', 'beatriz', 'tiago', 'anna', 'noah', 'elise', 'bram', 'fleur'],
  nordic: ['elias', 'ella', 'oskar', 'alma', 'william', 'astrid', 'liam', 'freja', 'nils', 'saga', 'emil', 'ingrid', 'aksel', 'nora', 'leo', 'sigrid'],
  eastEurope: ['ivan', 'olga', 'dmitri', 'anya', 'sasha', 'katya', 'mikhail', 'nadia', 'jakub', 'zofia', 'kacper', 'maja', 'oleh', 'iryna', 'nikos',
    'eleni', 'yannis', 'maria', 'pavel', 'vera', 'artem', 'daria', 'tomasz', 'ola'],
  latam: ['santiago', 'valentina', 'mateo', 'camila', 'sebastian', 'isabella', 'diego', 'lucia', 'nicolas', 'mariana', 'alejandro', 'sofia',
    'daniela', 'carlos', 'fernanda', 'juan', 'gabriela', 'andres', 'paula', 'tomas', 'abuela', 'pancho', 'lupe', 'emilia'],
  brazil: ['ana', 'joao', 'maria', 'pedro', 'beatriz', 'lucas', 'julia', 'gabriel', 'larissa', 'rafael', 'camila', 'gustavo', 'bruna', 'thiago',
    'leticia', 'felipe', 'vovo', 'caio', 'manu', 'duda'],
  mena: ['omar', 'layla', 'yusuf', 'mariam', 'ahmed', 'fatma', 'karim', 'nour', 'ali', 'huda', 'hamza', 'salma', 'mehmet', 'elif', 'emre', 'zeynep',
    'youssef', 'amina', 'khalid', 'reem', 'tarek', 'lina', 'samir', 'yasmin', 'can', 'deniz'],
  africa: ['chidi', 'ngozi', 'tunde', 'amara', 'kwame', 'akosua', 'kofi', 'ama', 'wanjiru', 'kamau', 'otieno', 'achieng', 'thabo', 'lerato', 'sipho',
    'naledi', 'abebe', 'selam', 'tendai', 'zuri', 'baraka', 'neema', 'musa', 'halima', 'emeka', 'funmi'],
  centralAsia: ['aidos', 'aruzhan', 'nurlan', 'dana', 'bat', 'saraa', 'temuulen', 'aigerim', 'yerlan', 'zarina'],
};

/** Playful extras that turn a first name into a race name. */
export const nameStyles: ((name: string, n: number) => string)[] = [
  name => name,
  name => name,
  name => name,
  name => name,
  (name, n) => `${name}${n % 100}`,
  (name, n) => `${name}${(n % 9) + 1}`,
  name => `${name}.walks`,
  name => `${name}_steps`,
  name => `${name} walks`,
  name => `${name}.moz`,
  name => `lil ${name}`,
  name => `${name}_go`,
];

/** Names that are not first names at all, for flavour. */
export const handles = ['stepqueen', 'walkmaster', 'sprouty', 'mozfan', 'tiny steps', 'night owl', 'early bird', 'the walker', 'park life', 'dosa.walker',
  'chai.walks', 'nomad', 'trailmix', 'moonwalker', 'sneakers', 'stairs.only', 'dog.walker', 'pace.ace', 'step.chef', 'long way home'];
