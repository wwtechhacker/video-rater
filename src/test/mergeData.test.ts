import { mergeData } from '../crawler/mergeData';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { db } from "../data/db";
import { systemSetting } from '../configs/systemSetting';
import Movie from "../models/movie";

const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
chai.should();
chai.use(chaiAsPromised);

describe('mergeData', () => {
  describe('mergeData', () => {
    it('should merge if chineseTitle match', function () {
      let yahooMovies:Array<Movie> = [{ yahooId: 1, chineseTitle: '測試' }];
      let pttPages = [{
        "articles": [
          {
            "title": "[好雷] 測試資料",
            "url": "https://www.ptt.cc/bbs/movie/M.1472305062.A.807.html",
          }]
      }];
      let actual:Array<Movie> = mergeData(yahooMovies,pttPages);
      assert.equal(JSON.stringify(actual[0].relatedArticles),JSON.stringify(pttPages[0].articles));
    });

    it('should relate if article date in range', function () {
      let yahooMovies:Array<Movie> = [{ yahooId: 1, chineseTitle: '測試', releaseDate:'2016-11-07' }];
      let pttPages = [{
        "articles": [
          {
            "title": "[好雷] 測試資料",
            "url": "https://www.ptt.cc/bbs/movie/M.1472305062.A.807.html",
            "date": "10/07"
          }]
      }];
      let actual:Array<Movie> = mergeData(yahooMovies,pttPages);
      assert.equal(JSON.stringify(actual[0].relatedArticles),JSON.stringify(pttPages[0].articles));
    });
  });
});