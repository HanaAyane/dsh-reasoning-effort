import type { ReactElement, ReactNode } from 'react';
type NativeProps = {
    t: (key: string) => string;
    locked: boolean;
    [key: string]: unknown;
};
type ElementProps = {
    children?: ReactNode;
    [key: string]: unknown;
};
export declare function mapNativeTree(node: ReactNode, transform: (element: ReactElement<ElementProps>) => ReactNode): ReactNode;
export declare function wrapNativeSelector(Native: (props: NativeProps) => ReactNode, renderPanel: (props: NativeProps) => ReactNode): (props: NativeProps) => ReactNode;
export {};
