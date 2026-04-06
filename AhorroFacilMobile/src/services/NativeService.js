// src/services/NativeService.js
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';

const NativeService = {
    tomarFoto: async () => {
        try {
            console.log("📸 Iniciando toma de foto...");
            
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: "Permiso de Cámara",
                        message: "AhorroFácil necesita acceso a la cámara.",
                        buttonPositive: "Aceptar",
                        buttonNegative: "Cancelar"
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert("Permiso denegado", "No se puede usar la cámara.");
                    return null;
                }
            }

            const result = await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
                saveToPhotos: true,
            });

            if (result.didCancel) return null;
            if (result.errorCode) {
                Alert.alert("Error", result.errorMessage);
                return null;
            }

            if (result.assets && result.assets.length > 0) {
                return { uri: result.assets[0].uri };
            }
            return null;
        } catch (error) {
            console.error("Error:", error);
            return null;
        }
    },

    obtenerUbicacion: async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Permiso de Ubicación",
                        message: "Necesitamos saber dónde realizaste el gasto.",
                        buttonPositive: "Aceptar"
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) return null;
            }

            return new Promise((resolve, reject) => {
                Geolocation.getCurrentPosition(
                    (position) => resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }),
                    (error) => reject(error),
                    { enableHighAccuracy: true, timeout: 15000 }
                );
            });
        } catch (error) {
            console.error("Error:", error);
            return null;
        }
    }
};

export default NativeService;