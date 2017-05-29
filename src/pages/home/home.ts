import { Component } from '@angular/core';
import { NavController, LoadingController, ActionSheetController } from 'ionic-angular';
import { Http } from '@angular/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';
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

  constructor(public navCtrl: NavController, public http: Http, public loadingCtrl: LoadingController, private iab: InAppBrowser, public actionSheetCtrl: ActionSheetController) {
    this.fetchContent();
  }

  showFilters() :void {

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

    if (this.hasFilter) {
      refresher.complete();
      return;
    }

    let self: any = this;
    let paramsUrl = self.feeds[0].data.name;

    this.http.get(this.newerPosts + paramsUrl).map(res => res.json())
      .subscribe(data => {
      
        this.feeds = data.data.children.concat(this.feeds);
        
        self.feeds.forEach((e, i, a) => {
          if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1 ) {  
            e.data.thumbnail = 'http://www.redditstatic.com/icon.png';
          }
        })
        refresher.complete();
      });

    this.noFilter = this.feeds;
    this.hasFilter = false;
  }

  doInfinite(infiniteScroll) {

    if (this.hasFilter) {
      infiniteScroll.complete();
      return;
    }
      
    let self: any = this;
    let paramsUrl = (this.feeds.length > 0) ? self.feeds[this.feeds.length - 1].data.name : "";

    this.http.get(this.olderPosts + paramsUrl).map(res => res.json())
      .subscribe(data => {
      
        this.feeds = this.feeds.concat(data.data.children);
        
        self.feeds.forEach((e, i, a) => {
          if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1 ) {  
            e.data.thumbnail = 'http://www.redditstatic.com/icon.png';
          }
        })
        infiniteScroll.complete();
      });

    this.noFilter = this.feeds;
    this.hasFilter = false;
  }

  fetchContent ():void {
    let loading = this.loadingCtrl.create({
      content: 'Fetching content...'
    });

    loading.present();


    this.http.get(this.url).map(res => res.json())
      .subscribe(data => {

        this.feeds = data.data.children;

        this.feeds.forEach((e: any, i, a) => {
          if (!e.data.thumbnail || e.data.thumbnail.indexOf('b.thumbs.redditmedia.com') === -1 ) { 
            e.data.thumbnail = 'http://www.redditstatic.com/icon.png';
          }
        });

        loading.dismiss();
      });
  }
  
  itemSelected (url: string):void {
    const browser = this.iab.create(url);
  }

}
