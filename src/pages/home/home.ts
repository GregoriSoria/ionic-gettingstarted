import { Component, ViewChild } from '@angular/core';
import { NavController, LoadingController, ActionSheetController, Content } from 'ionic-angular';
import { Http } from '@angular/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { RedditServiceProvider } from '../../providers/reddit-service/reddit-service';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public noFilter: Array<any>;
  public hasFilter: boolean = false;
  public feeds: Array<string>;
  private url: string = "https://www.reddit.com/new.json";
  private olderPosts: string = "https://www.reddit.com/new.json?after=";
  private newerPosts: string = "https://www.reddit.com/new.json?before=";
  private searchTerm: string;
  @ViewChild(Content) public content: Content;

  constructor(public navCtrl: NavController, public http: Http, public loadingCtrl: LoadingController, private iab: InAppBrowser, public actionSheetCtrl: ActionSheetController, public redditService: RedditServiceProvider) {
    this.fetchContent();
  }

  filterItems() {
    this.hasFilter = false;
    this.feeds = this.noFilter.filter((item) => {
      return item.data.title.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1;
    });
  }

  showFilters() :void {
    this.content.scrollToTop();

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Filter options:',
      buttons: [
        {
          text: 'Music',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "music");
            this.hasFilter = true;
          }
        },
        {
          text: 'Movies',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "movies");
            this.hasFilter = true;
          }
        },
        {
          text: 'Games',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "gaming");
            this.hasFilter = true;
          }
        },
        {
          text: 'Pictures',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "pics");
            this.hasFilter = true;
          }
        },                
        {
          text: 'Ask Reddit',
          handler: () => {
            this.feeds = this.noFilter.filter((item) => item.data.subreddit.toLowerCase() === "askreddit");
            this.hasFilter = true;
          }
        },        
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.feeds = this.noFilter;
            this.hasFilter = false;
          }
        }
      ]
    });

    actionSheet.present();

  }

  doRefresh(refresher) {

    let self: any = this;
    let paramsUrl = self.feeds[0].data.name;

    this.redditService.fetchData(this.newerPosts + paramsUrl).then(data => {
      this.feeds = data.concat(this.feeds);
      this.noFilter = this.feeds;
      this.hasFilter = false;
      refresher.complete();
    });
  }

  doInfinite(infiniteScroll) {

    if (this.hasFilter) {
      infiniteScroll.complete();
      return;
    }
      
    let self: any = this;
    let paramsUrl = (this.feeds.length > 0) ? self.feeds[this.feeds.length - 1].data.name : "";

    this.redditService.fetchData(this.olderPosts + paramsUrl).then(data => {
      this.feeds = this.feeds.concat(data);
      this.noFilter = this.feeds;
      this.hasFilter = false;
      infiniteScroll.complete();
    });
  }

  fetchContent ():void {
    let loading = this.loadingCtrl.create({
      content: 'Fetching content...'
    });

    loading.present();

    this.redditService.fetchData(this.url).then(data => {
      this.feeds = data;
      this.noFilter = this.feeds;
      loading.dismiss();
    });
  }
  
  itemSelected (url: string):void {
    const browser = this.iab.create(url);
  }

}
