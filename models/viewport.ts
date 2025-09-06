export interface Viewport {
    name: string;
    width: number;
    height: number;
}

export const viewports: Viewport[] = [
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 },
];
