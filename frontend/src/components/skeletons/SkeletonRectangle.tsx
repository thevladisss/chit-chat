import { JSX, Children, useMemo, HTMLProps } from 'preact/compat';
import './SkeletonRectangle.css';

type Props = HTMLProps<any> & {
  children: Children;
  width: string | number;
  height: string | number;
};
function SkeletonRectangle({
  children,
  height,
  width,
  className,
}: Props): JSX.Element {
  const style = useMemo(() => {
    return {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    };
  }, [height, width]);

  return (
    <div className={`skeleton-rectangle ${className ?? ''}`} style={style}>
      {children}
    </div>
  );
}

export default SkeletonRectangle;
