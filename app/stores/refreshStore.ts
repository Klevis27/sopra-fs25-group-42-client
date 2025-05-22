import { EventEmitter } from "events";

class RefreshStore extends EventEmitter {
  refresh = () => {
    this.emit("refresh");
  };

  subscribe(callback: () => void): () => void {
    this.on("refresh", callback);
    return () => this.off("refresh", callback); // cleanup function
  }
}

export const refreshStore = new RefreshStore();
