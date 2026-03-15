import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';

export const NativeService = {
    // 1. FUNCIONALIDAD DE CÁMARA
    tomarFoto: async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Permiso de Cámara",
                    message: "AhorroFácil necesita acceso a la cámara para capturar tus recibos.",
                    buttonPositive: "Aceptar"
                }
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert("Permiso denegado", "No se puede usar la cámara sin autorización.");
                return null;
            }
        }

        const result = await launchCamera({
            mediaType: 'photo',
            quality: 0.5,
            saveToPhotos: true,
        });

        return result.assets ? result.assets[0].uri : null;
    },

    // 2. FUNCIONALIDAD DE GEOLOCALIZACIÓN
    obtenerUbicacion: async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Permiso de Ubicación",
                    message: "Necesitamos saber dónde realizaste el gasto.",
                    buttonPositive: "Aceptar"
                }
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert("Permiso denegado", "No se puede obtener la ubicación.");
                return null;
            }
        }

        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    Alert.alert("Error de GPS", error.message);
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        });
    }
};