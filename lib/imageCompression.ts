import * as ImageManipulator from 'expo-image-manipulator';

export const imageCompressionService = {
  /**
   * Compress image for profile photo
   * Target: ~500x500px, quality 0.8
   */
  async compressProfilePhoto(imageUri: string): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(imageUri, [
        { resize: { width: 500, height: 500 } },
      ], {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      return result.uri;
    } catch (error) {
      console.error('Error compressing profile photo:', error);
      return imageUri; // Return original if compression fails
    }
  },

  /**
   * Compress image for vehicle photo
   * Target: ~800x600px, quality 0.75
   */
  async compressVehiclePhoto(imageUri: string): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(imageUri, [
        { resize: { width: 800, height: 600 } },
      ], {
        compress: 0.75,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      return result.uri;
    } catch (error) {
      console.error('Error compressing vehicle photo:', error);
      return imageUri;
    }
  },

  /**
   * Compress image for general use
   * Target: custom dimensions with custom quality
   */
  async compressImage(
    imageUri: string,
    width: number = 800,
    height: number = 600,
    quality: number = 0.8
  ): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(imageUri, [
        { resize: { width, height } },
      ], {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      return result.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return imageUri;
    }
  },
};