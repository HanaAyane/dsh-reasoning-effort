import type { ReactElement, ReactNode } from 'react';
import type { ModelSelection } from '@deepseek-ai/dsh-api-session-controller/types';
import type { ModelDirectory } from '@deepseek-ai/dsh-client-ui-model-selection/client';
type NativeProps = {
    t: (key: string) => string;
    locked: boolean;
    directory: ModelDirectory['store'];
    select: (selection: ModelSelection) => Promise<Awaited<ReturnType<ModelDirectory['select']>> | undefined>;
    [key: string]: unknown;
};
type ElementProps = {
    children?: ReactNode;
    [key: string]: unknown;
};
export declare function mapNativeTree(node: ReactNode, transform: (element: ReactElement<ElementProps>) => ReactNode): ReactNode;
export declare function wrapNativeSelector(Native: (props: NativeProps) => ReactNode, renderPanel: (props: NativeProps) => ReactNode): (props: NativeProps) => ReactNode;
export {};
