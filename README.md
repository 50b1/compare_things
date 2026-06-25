# Things Comparison

A pairwise comparison tool that ranks items based on 1-vs-1 choices.

## How to Run

1. Open a terminal and navigate to the project folder:

   ```bash
   cd /home/sobczakt/things_comparision
   ```

2. Start a local HTTP server (Python 3 required):

   ```bash
   python3 -m http.server 8080
   ```

3. Open your browser and go to:

   ```
   http://localhost:8080
   ```

4. To stop the server, press `Ctrl+C` in the terminal.

## Usage

1. **Add items** — Enter text or upload images.
2. **Compare** — Click the item you prefer in each pair. Use "Skip" for ties and "Undo" to go back.
3. **View results** — Items are ranked by ELO score after all comparisons are done.
