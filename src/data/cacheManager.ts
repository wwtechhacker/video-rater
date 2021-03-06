import * as memoryCache from 'memory-cache';
import { db } from "../data/db";
import { mergeData } from '../crawler/mergeData';
import * as moment from 'moment';
import Movie from '../models/movie';
import { getInTheaterMovieNames } from '../crawler/atmovieInTheaterCrawler';
import { roughSizeOfObject } from '../helper/util';
import { getMoviesSchedules, updateMoviesSchedules } from '../task/atmoviesTask';
import isValideDate from '../helper/isValideDate';


export default class cacheManager {
    static All_MOVIES = 'allMovies';
    static All_MOVIES_NAMES = 'allMoviesNames';
    static RECENT_MOVIES = 'recentMovies';
    static MOVIES_SCHEDULES = 'MoviesSchedules';
    static THEATERS = 'theaters';
    static async init() {
        const yahooMoviesPromise = db.getCollection({ name: "yahooMovies", sort: { yahooId: -1 } });
        const pttArticlesPromise = db.getCollection({ name: "pttArticles" });
        console.time('get yahooMovies and pttArticles');
        const [yahooMovies, pttArticles] = await Promise.all([yahooMoviesPromise, pttArticlesPromise]);
        console.timeEnd('get yahooMovies and pttArticles');
        cacheManager.setAllMoviesNamesCache(yahooMovies);
        cacheManager.setAllMoviesCache(yahooMovies, pttArticles);
        cacheManager.setTheatersCache();
        await cacheManager.setRecentMoviesCache();
        await cacheManager.setMoviesSchedulesCache()
    }

    private static setAllMoviesNamesCache(yahooMovies: Array<Movie>) {
        let allMoviesName = [];
        console.time('setAllMoviesNamesCache');
        yahooMovies.forEach(({ chineseTitle, englishTitle, yahooId }) => {
            if (chineseTitle) {
                allMoviesName.push({ value: yahooId, text: chineseTitle });
            }
            if (englishTitle && englishTitle !== chineseTitle) {
                allMoviesName.push({ value: yahooId, text: englishTitle });
            }
        });

        cacheManager.set(cacheManager.All_MOVIES_NAMES, allMoviesName);
        console.timeEnd('setAllMoviesNamesCache');
    }

    private static setAllMoviesCache(yahooMovies, pttArticles) {
        console.time('mergeData');
        let mergedDatas = mergeData(yahooMovies, pttArticles);
        console.timeEnd('mergeData');
        cacheManager.set(cacheManager.All_MOVIES, mergedDatas);
    }

    private static async setTheatersCache() {
        console.time('setTheatersCache');
        const theaterListWithLocation = await db.getCollection({ name: "theaters", sort: { "regionIndex": 1 } });
        console.timeEnd('setTheatersCache');
        cacheManager.set(cacheManager.THEATERS, theaterListWithLocation);
    }
    
    public static async setRecentMoviesCache() {
        console.time('setRecentMoviesCache');
        const inTheaterMovieNames = await getInTheaterMovieNames();
        const hasInTheaterData = inTheaterMovieNames && inTheaterMovieNames.length
        const today = moment();
        const recentMovies = cacheManager.get(cacheManager.All_MOVIES)
            .filter(({ chineseTitle, releaseDate }: Movie) => {
                const releaseMoment = isValideDate(releaseDate)? moment(releaseDate) : moment();
                return (!hasInTheaterData || inTheaterMovieNames.indexOf(chineseTitle) !== -1) && today.diff(releaseMoment, 'days') <= 60
            })
        cacheManager.set(cacheManager.RECENT_MOVIES, recentMovies);
        console.timeEnd('setRecentMoviesCache');
    }

    public static async setMoviesSchedulesCache() {
        console.time('setMoviesSchedulesCache');
        try {
            await updateMoviesSchedules();
            const allSchedules = await getMoviesSchedules();
            const recentMovieChineseTitles: string[] = cacheManager.get(cacheManager.RECENT_MOVIES).map(movie => movie.chineseTitle);
            const filterdSchedules = allSchedules.filter(schedule => recentMovieChineseTitles.indexOf(schedule.movieName) !== -1);
            cacheManager.set(cacheManager.MOVIES_SCHEDULES, filterdSchedules);
        } catch (ex) {
            console.error(ex)
        }
        console.timeEnd('setMoviesSchedulesCache');
    }
    
    static get(key) {
        let data = memoryCache.get(key);
        return data;
    }

    static set(key, value) {
        memoryCache.put(key, value);
        console.log(`${key} size:${roughSizeOfObject(value)}`);
    }
}
