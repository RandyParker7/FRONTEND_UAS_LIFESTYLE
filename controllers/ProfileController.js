app.controller('ProfileController', function($scope, $http, $location) {
    const token = localStorage.getItem('authToken');

    if (!token) {
        $scope.errorMessage = 'You must be logged in to view your profile';
        return;
    }

    const headers = { 'Authorization': 'Bearer ' + token };

    // Fetch the user profile data, including the image
    $http.get('http://localhost:3000/api/profile', { headers: headers })
        .then(function(response) {
            $scope.user = response.data;
            // Fetch and display the profile image
            $http.get('http://localhost:3000/api/profileImage', { headers: headers, responseType: 'arraybuffer' })
                .then(function(imageResponse) {
                    const base64Image = btoa(String.fromCharCode.apply(null, new Uint8Array(imageResponse.data)));
                    $scope.profileImage = 'data:image/jpeg;base64,' + base64Image;
                })
                .catch(function(error) {
                    console.error('Error fetching profile image:', error);
                });
        })
        .catch(function(error) {
            $scope.errorMessage = error.data.message || 'Failed to fetch profile. Please try again.';
        });

    // Handle profile image upload
    $scope.uploadImage = function(file) {
        if (!file || file.length === 0) {
            console.error('No file selected');
            return;
        }
    
        const formData = new FormData();
        formData.append('image', file[0]);
    
        const token = localStorage.getItem('authToken');
    
        $http.post('http://localhost:3000/api/uploadProfileImage', formData, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': undefined  // Let the browser set the Content-Type boundary
            },
            transformRequest: angular.identity
        })
        .then(function(response) {
            console.log('Image uploaded successfully:', response.data);
            $scope.successMessage = 'Profile image uploaded successfully!';
            
            // Refresh the profile image after upload
            $http.get('http://localhost:3000/api/profileImage', { headers: headers, responseType: 'arraybuffer' })
                .then(function(imageResponse) {
                    const base64Image = btoa(String.fromCharCode.apply(null, new Uint8Array(imageResponse.data)));
                    $scope.profileImage = 'data:image/jpeg;base64,' + base64Image;
                })
                .catch(function(error) {
                    console.error('Error fetching updated profile image:', error);
                });
        })
        .catch(function(error) {
            console.error('Error uploading image:', error);
            $scope.errorMessage = 'Error uploading image.';
        });
    };

    // Logout function
    $scope.logout = function() {
        localStorage.removeItem('authToken');
        $scope.user = null;
        $scope.errorMessage = 'You have successfully logged out.';
        $location.path('/');
    };

    $scope.deleteAccount = function() {
        if (!confirm("Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan!")) {
            return;
        }
    
        const token = localStorage.getItem('authToken');
        const headers = { 'Authorization': 'Bearer ' + token };
    
        $http.delete('http://localhost:3000/api/deleteAccount', { headers: headers })
            .then(function(response) {
                alert('Akun berhasil dihapus. Anda akan dialihkan ke halaman utama.');
                localStorage.removeItem('authToken');
                $location.path('/');
            })
            .catch(function(error) {
                console.error('Error deleting account:', error);
                $scope.errorMessage = 'Terjadi kesalahan saat menghapus akun. Silakan coba lagi.';
            });
    };

    $scope.showChangePasswordForm = false;

    $scope.toggleChangePasswordForm = function() {
        $scope.showChangePasswordForm = !$scope.showChangePasswordForm;
    
        $scope.oldPassword = '';
        $scope.newPassword = '';
        $scope.confirmNewPassword = '';
        $scope.errorMessage = '';
    
        if ($scope.showChangePasswordForm) {
            $('#changePasswordModal').modal('show');
        } else {
            $('#changePasswordModal').modal('hide');
        }
    };
    
    $scope.changePassword = function() {
        if ($scope.newPassword !== $scope.confirmNewPassword) {
            $scope.errorMessage = 'Password baru dan konfirmasi tidak cocok.';
            return;
        }
    
        const token = localStorage.getItem('authToken');
        const headers = { 'Authorization': 'Bearer ' + token };
    
        const payload = {
            oldPassword: $scope.oldPassword,
            newPassword: $scope.newPassword
        };
    
        $http.post('http://localhost:3000/api/changePassword', payload, { headers: headers })
            .then(function(response) {
                alert('Password berhasil diubah.');
                $scope.toggleChangePasswordForm();
            })
            .catch(function(error) {
                console.error('Error changing password:', error);
                $scope.errorMessage = error.data.message || 'Terjadi kesalahan saat mengubah password.';
            });
    };
});
