import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';


export const moveToTrash = async (assets) => {
    const assetsToArray = Array.isArray(assets) ? assets : [assets];

    // Filtrar assets inválidos
    const validAssets = assetsToArray.filter(a => a && a.id);

    if (validAssets.length === 0) {
        console.warn("moveToTrash: No se proporcionaron assets válidos.");
        return false;
    }

    try {
        const result = await MediaLibrary.deleteAssetsAsync(validAssets);

        return result;
    } catch (error) {
        console.error("Error al mover a la papelera:", error);

        return false;
    }
};

export default moveToTrash;
