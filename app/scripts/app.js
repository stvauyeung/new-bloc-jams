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
      { name: 'Blue', length: 163.38, audioUrl: '/music/placeholders/blue' },
      { name: 'Green', length: 105.66, audioUrl: '/music/placeholders/green' },
      { name: 'Red', length: 270.14, audioUrl: '/music/placeholders/red' },
      { name: 'Pink', length: 154.81, audioUrl: '/music/placeholders/pink' },
      { name: 'Magenta', length: 375.92, audioUrl: '/music/placeholders/magenta' }
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
        seek: function(time) {
          if (currentSoundFile) {
            currentSoundFile.setTime(time);
          }
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

  blocJams.directive('slider', ['$document', function() {

    var calculateSliderPercentFromMouseEvent = function($slider, event) {
      var offsetX = event.pageX - $slider.offset().left;
      var sliderWidth = $slider.width();
      var offsetXPercent = ( offsetX / sliderWidth );
      offsetXPercent = Math.max(0, offsetXPercent);
      offsetXPercent = Math.min(1, offsetXPercent);
      return offsetXPercent;
    };

    var numberFromValue = function(value, defaultValue) {
      if (typeof value === 'number') {
        return value;
      }

      if (typeof value === 'undefined') {
        return defaultValue;
      }

      if (typeof value === 'string') {
        return Number(value);
      }
    };
   
    return {
      templateUrl: 'templates/directives/slider.html',
      replace: true,
      restrict: 'E',
      scope: {
        onChange: '&'
      },
      link: function(scope, element, attributes) {
        scope.value = 0;
        scope.max = 100;
        var $seekBar = $(element);
        console.log(attributes);
        
        attributes.$observe('value', function(newValue) {
          scope.value = numberFromValue(newValue, 0);
        });

        attributes.$observe('max', function(newValue) {
          scope.max = numberFromValue(newValue, 100) || 100;
        });
        
        var percentString = function() {
          var value = scope.value || 0;
          var max = scope.max || 100;
          percent = value / max * 100;
          return percent + "%";
        };

        var notifyCallback = function(newValue) {
          if (typeof scope.onChange === 'function') {
            scope.onChange({value: newValue});
          };
        };

        scope.fillStyle = function() {
          return {width: percentString()};
        };

        scope.thumbStyle = function() {
          return {left: percentString()};
        };

        scope.onClickSlider = function(event) {
          var percent = calculateSliderPercentFromMouseEvent($seekBar, event);
          scope.value = percent * scope.max;
          notifyCallback(scope.value);
        };

        scope.trackThumb = function() {
          $document.bind('mousemove.thumb', function(event) {
            scope.$apply(function() {
              scope.value = percent * scope.max;
              notifyCallback(scope.value);
            });
          });

          $document.bind('mouseup.thumb', function() {
            $document.unbind('mousemove.thumb');
            $document.unbind('mouseup.thumb');
          });
        };
      }
    };
  }]);