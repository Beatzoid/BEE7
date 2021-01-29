export default class Util {
    public convertTime(duration: number): string {
        const portions: string[] = [];

        const msInHour = 1000 * 60 * 60;
        const hours = Math.trunc(duration / msInHour);
        if (hours > 0) {
            portions.push(hours + "h");
            duration = duration - hours * msInHour;
        }

        const msInMinute = 1000 * 60;
        const minutes = Math.trunc(duration / msInMinute);
        if (minutes > 0) {
            portions.push(minutes + "m");
            duration = duration - minutes * msInMinute;
        }

        const seconds = Math.trunc(duration / 1000);
        if (seconds > 0) {
            portions.push(seconds + "s");
        }

        return portions.join(" ");
    }

    getBoolean(value: string): boolean {
        switch (value.trim()) {
            case "true":
            case "1":
            case "on":
            case "yes":
                return true;
            default:
                return false;
        }
    }

    titleCase(convert: string): string {
        return convert
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
}
