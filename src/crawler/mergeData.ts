import YahooMovie from '../models/yahooMovie';
import Movie from '../models/movie';
import Article from '../models/article';
import * as moment from 'moment';

export function mergeData(yahooMovies: Array<YahooMovie>, pttPages) {
    //merge [[1,2],[3,4]] to [1,2,3,4]
    let allArticles = [].concat(...pttPages.map(({articles}) => articles));
    let mergedMovies = yahooMovies.map(mergeByChineseTitle);
    return mergedMovies;

    function mergeByChineseTitle(movie: Movie) {
        let chineseTitle = movie.chineseTitle;
        let releaseDate = moment(movie.releaseDate);
        let releaseYear = releaseDate.year();
        let rangeStart = releaseDate.clone().subtract(2, 'months');
        let rangeEnd = releaseDate.clone().add(3, 'months');

        movie.relatedArticles = allArticles.filter(({title, date}: Article) => {
            let isChinesetitleMatch = title.indexOf(chineseTitle) !== -1;
            if(isChinesetitleMatch && date){
                //let articleYear = //todo: wait to cralwer provide.
                let articleFullDate = releaseYear + '/' + date.trim();
                let isInNearMonth = moment(articleFullDate, 'YYYY/MM/DD').isBetween(rangeStart, rangeEnd);
                return isInNearMonth;
            }
            return isChinesetitleMatch;
        });
        return movie;
    }
}


