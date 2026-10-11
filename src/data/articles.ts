import rawArticles from './mozy-articles.json';
import type { Article } from '../types/article';

/** Every article in the dataset, including ones held back by an editorial hold. */
export const allArticles = rawArticles as unknown as Article[];

/** Articles that may be listed, linked as related reading and rendered: everything without `editorial.hold`. */
export const articles = allArticles.filter(article => !article.editorial?.hold);
