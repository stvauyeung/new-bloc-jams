// require("./landing");
// require("./collection");
// require("./album");
// require("./profile");
var albumPicasso = {
  name: 'The Colors',
  artist: 'Pablo Picasso',
  label: 'Cubism',
  year: '1881',
  albumArtUrl: '/images/album-placeholder.png',
  songs: [
      { name: 'Blue', length: '4:26', audioUrl: '/music/placeholders/blue' },
      { name: 'Green', length: '3:14', audioUrl: '/music/placeholders/green' },
      { name: 'Red', length: '5:01', audioUrl: '/music/placeholders/red' },
      { name: 'Pink', length: '3:21', audioUrl: '/music/placeholders/pink' },
      { name: 'Magenta', length: '2:15', audioUrl: '/music/placeholders/magenta' }
  ]
};

blocJams = angular.module('BlocJams', ['ui.router']);

blocJams.config(['$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider
    .state('landing', {
      url: '/',
      controller: 'Landing.controller',
      templateUrl: '/templates/landing.html'
    })
    .state('song', {
      url: '/song',
      templateUrl: '/templates/song.html'
    })
    .state('collection', {
      url: '/collection',
      controller: 'Collection.controller',
      templateUrl: '/templates/collection.html'
    })
    .state('album', {
      url: '/album',
      templateUrl: '/templates/album.html',
      controller: 'Album.controller'
    });
}]);

blocJams
  .controller('Landing.controller', ['$scope', 'ConsoleLogger', function($scope, ConsoleLogger) {
    $scope.subText = "Turn the music up!";
    $scope.subTextClicked = function() {
      $scope.subText += '!';
    };

    $scope.albumURLs = [
      '/images/album-placeholders/album-1.jpg',
      '/images/album-placeholders/album-2.jpg',
      '/images/album-placeholders/album-3.jpg',
      '/images/album-placeholders/album-4.jpg',
      '/images/album-placeholders/album-5.jpg',
      '/images/album-placeholders/album-6.jpg',
      '/images/album-placeholders/album-7.jpg',
      '/images/album-placeholders/album-8.jpg',
      '/images/album-placeholders/album-9.jpg',
    ];

    ConsoleLogger.log();
  }])
  .controller('Collection.controller', ['$scope', 'SongPlayer', function($scope, SongPlayer) {
    $scope.albums = [];
    for (var i = 0; i < 33; i++) {
      $scope.albums.push(angular.copy(albumPicasso));
    };
    $scope.playAlbum = function(album) {
      SongPlayer.setSong(album, album.songs[0]);
    };
  }])
  .controller('Album.controller', ['$scope', 'SongPlayer', 'ConsoleLogger', function($scope, SongPlayer, ConsoleLogger) {
    $scope.album = angular.copy(albumPicasso);

    var hoveredSong = null;

    $scope.onHoverSong = function(song) {
      hoveredSong = song;
    };

    $scope.offHoverSong = function(song) {
      hoveredSong = null;
    };

    $scope.startPlayingSong = function(song) {
      SongPlayer.setSong($scope.album, song);
    };

    $scope.stopPlayingSong = function(song) {
      SongPlayer.pause();
    };

    $scope.getSongState = function(song) {
      if (song === SongPlayer.currentSong && SongPlayer.playing) {
        return 'playing';
      } else if (song === hoveredSong) {
        return 'hovered';
      }
      return 'default';
    };
    $scope.userInput = '';
    $scope.consoleLog = function(input) {
      ConsoleLogger.setString(input);
    };
  }])
  .controller('PlayerBar.controller', ['$scope', 'SongPlayer', 'ConsoleLogger', function($scope, SongPlayer, ConsoleLogger) {
    $scope.songPlayer = SongPlayer;
    ConsoleLogger.log();
  }]);

  blocJams
    .service('SongPlayer', function() {
      var currentSoundFile = null;
      var trackIndex = function(album, song) {
        return album.songs.indexOf(song);
      };

      return {
        currentSong: null,
        currentAlbum: null,
        playing: false,

        play: function() {
          this.playing = true;
          currentSoundFile.play();
        },
        pause: function() {
          this.playing = false;
          currentSoundFile.pause();
        },
        next: function() {
          if (this.currentSong) {
            var currentTrackIndex = trackIndex(this.currentAlbum, this.currentSong);
            currentTrackIndex++;
            if (currentTrackIndex >= this.currentAlbum.songs.length) {
              currentTrackIndex = 0;
            }
            var song = this.currentAlbum.songs[currentTrackIndex];
            this.setSong(this.currentAlbum, song);
          };
        },
        previous: function() {
          if (this.currentSong) {
            var currentTrackIndex = trackIndex(this.currentAlbum, this.currentSong);
            currentTrackIndex--;
            if (currentTrackIndex < 0) {
              currentTrackIndex = this.currentAlbum.songs.length - 1;
            }
            var song = this.currentAlbum.songs[currentTrackIndex];
            this.setSong(this.currentAlbum, song);
          };
        },
        setSong: function(album, song) {
          if (currentSoundFile) {
            currentSoundFile.stop();
          }
          this.currentAlbum = album,
          this.currentSong = song;
          currentSoundFile = new buzz.sound(song.audioUrl, {
            formats: ["mp3"],
            preload: true
          });

          this.play();
        }
      };
    })
    .service('ConsoleLogger', function() {
      return {
        logString: '',

        setString: function(newString) {
          this.logString = newString;
        },
        log: function() {
          console.log(this.logString);
        }
      };
    });