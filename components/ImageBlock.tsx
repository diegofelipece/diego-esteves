import styles from '../styles/components/ImageBlock.module.scss';
import sitePath from '../utils/sitePath';

type Props = {
  src: string;
  alt?: string;
  width?: number;
  heigth?: number;
}

const ImageBlock = ({ src, alt, width, heigth }: Props) => {
  return (
    <div className={styles.image_block}>
      <img
        src={sitePath(`/images/${src}`)}
        alt={alt || ''}
        width={width}
        height={heigth}
        loading="lazy"
      />
    </div>
  )
};

export default ImageBlock;
