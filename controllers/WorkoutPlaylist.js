app.controller('WorkoutPlaylistController', function ($scope) {
    console.log('WorkoutPlaylistController initialized');

    // Fungsi untuk menangani tombol
    $scope.handleButtonClick = function (type) {
        if (type === 'spotify') {
            alert("Opening Spotify Playlist: Energizing Beats!");
        } else if (type === 'youtube') {
            alert("Opening YouTube Playlist: High-Intensity Music!");
        }
    };
});
