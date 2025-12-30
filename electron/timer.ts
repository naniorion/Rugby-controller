import { EventEmitter } from 'events';

export class TimerManager extends EventEmitter {
    private startTime: number = 0;
    private accumulatedTime: number = 0; // ms
    private isRunning: boolean = false;
    private intervalId: NodeJS.Timeout | null = null;

    // Get current time in seconds
    getTimeSeconds(): number {
        let currentChunk = 0;
        if (this.isRunning) {
            currentChunk = Date.now() - this.startTime;
        }
        return Math.floor((this.accumulatedTime + currentChunk) / 1000);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = Date.now();

        this.intervalId = setInterval(() => {
            this.emit('tick', this.getTimeSeconds());
        }, 1000);
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        this.accumulatedTime += Date.now() - this.startTime;
        if (this.intervalId) clearInterval(this.intervalId);
        this.emit('tick', this.getTimeSeconds());
    }

    reset(newTimeSeconds: number = 0) {
        this.stop();
        this.accumulatedTime = newTimeSeconds * 1000;
        this.emit('tick', this.getTimeSeconds());
    }

    set(newTimeSeconds: number) {
        const wasRunning = this.isRunning;
        this.stop();
        this.accumulatedTime = newTimeSeconds * 1000;
        if (wasRunning) this.start();
        else this.emit('tick', this.getTimeSeconds());
    }
}
