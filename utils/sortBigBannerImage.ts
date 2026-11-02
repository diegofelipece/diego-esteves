import sitePath from './sitePath';
import { home } from '../content';

const sortBigBannerImage = () => {
  const images = home.bannerImages.map(sitePath);

  const bgUrl = images[Math.floor(Math.random()*images.length)];
  return bgUrl;
}

export default sortBigBannerImage;