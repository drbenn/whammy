export interface Dialog {
    componentType: string,
    title: string,
    text: string
}

export interface ZoomAlterOptions {
    zoomLevel: number,
    latLng: [number, number],
    // duration in ms
    duration: number
    }

export interface TTData {
        topic: string,
        title: string
    }