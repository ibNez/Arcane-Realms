import type { Buffer } from 'node:buffer';
import * as tf from '@tensorflow/tfjs-node';
import nsfwjs from 'nsfwjs';
import sharp from 'sharp';

class NSFWDetector {
  private modelPromise = nsfwjs.load();

  async isInappropriate(imageData: Buffer): Promise<boolean> {
    const model = await this.modelPromise;
    const image = await tf.node.decodeImage(imageData, 3);
    const predictions = await model.classify(image) as Array<{ className: string; probability: number }>;
    image.dispose();
    return predictions.some((p: { className: string; probability: number }) => (
      ['Hentai', 'Porn', 'Sexy'].includes(p.className) && p.probability > 0.6
    ));
  }
}

class QualityAssessor {
  async meetsStandards(imageData: Buffer): Promise<boolean> {
    const img = sharp(imageData);
    const metadata = await img.metadata();
    if (!metadata.width || !metadata.height || metadata.width < 256 || metadata.height < 256) return false;
    const stats = await img.stats();
    return stats.entropy > 3;
  }
}

class StyleValidator {
  private palette = [
    { r: 150, g: 80, b: 40 },
    { r: 60, g: 120, b: 200 }
  ];

  async matchesGameStyle(imageData: Buffer): Promise<boolean> {
    const { dominant } = await sharp(imageData).stats();
    if (!dominant) return false;
    return this.palette.some(c => {
      const dist = Math.sqrt(
        Math.pow(dominant.r - c.r, 2) +
        Math.pow(dominant.g - c.g, 2) +
        Math.pow(dominant.b - c.b, 2)
      );
      return dist < 100;
    });
  }
}

// Placeholder generator instruction
function retryWithNewSeed(): void {
  console.warn('Content validation failed. Retrying with a new seed...');
}

export class ContentFilter {
  private nsfwDetector = new NSFWDetector();
  private qualityAssessor = new QualityAssessor();
  private styleValidator = new StyleValidator();

  async validate(imageData: Buffer): Promise<boolean> {
    if (await this.nsfwDetector.isInappropriate(imageData)) {
      retryWithNewSeed();
      return false;
    }

    if (!(await this.qualityAssessor.meetsStandards(imageData))) {
      retryWithNewSeed();
      return false;
    }

    if (!(await this.styleValidator.matchesGameStyle(imageData))) {
      retryWithNewSeed();
      return false;
    }

    return true;
  }
}

export const contentFilter = new ContentFilter();
export default contentFilter;
