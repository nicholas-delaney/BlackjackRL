class DisplayLearning {
    constructor() {
        this.ctx = canvas.getContext("2d");
        this.ai = new BlackjackRL();
        this.headings = [];
        this.title = { pos: { x: 450, y: 20 }, text: "Blackjack Reinforment Learning" };
        this.qIterationsHeading = { pos: { x: 5, y: 40 }, text: "Perform Q-learning iterations:" };
        this.viewStatsHeading = { pos: { x: 490, y: 150 }, text: "View State Stats" };
        this.buttons = [];
        this.bSize = { x: 120, y: 25 };
        this.singleQIteration = { pos: { x: 40, y: 50 }, text: "Single Iteration" };
        this.thousandQIteration = { pos: { x: 40, y: 90 }, text: "1,000 Iterations" };
        this.hundredThousandQIteration = { pos: { x: 40, y: 130 }, text: "1,000,000 Iterations" };
        this.viewPolicy = { pos: { x: 430, y: 160 }, text: "View Policy" };
        this.viewValue = { pos: { x: 570, y: 160 }, text: "View Value" };
        this.instructions = { pos: { x: 505, y: 40 } , text: "Show Instructions" };
        this.stats = [];
        this.wins = { pos: { x: 772, y: 70 }, text: "  Wins: " };
        this.losses = { pos: { x: 770, y: 90 }, text: "Losses: " };
        this.draws = { pos: { x: 768, y: 110 }, text: " Draws: " };
        this.tIterations = { pos: { x: 768, y: 130 }, text: " Total Iterations: " };
        this.states = []
        this.pSums = [];
        this.pSumsPos = { x: 60, y: 200 };
        this.pSumsSize = { x: 35, y: 25 };
        this.hasAce = [];
        this.hasAcePos = { pos: { x: 5, y: 200 } };
        this.hasAceSize = { x: 25, y: 40 };
        this.hoveredButton = { text: null };
        this.showValue = false;
        this.lines = [];
        this.click = {
            clicking: false,
            start: 0,
            time: 200
        }
        this.init();
    }
    init() {
        this.buttons = [
            this.singleQIteration, this.thousandQIteration, this.hundredThousandQIteration,
            this.viewPolicy, this.viewValue, this.instructions
        ];
        this.headings = [this.title, this.qIterationsHeading, this.viewStatsHeading];
        this.stats = [this.wins, this.draws, this.losses, this.tIterations ];
        this.parameters = [this.epsilon, this.alpha, this.gamma];
        this.lines = [
            { x1: 77, x2: 54, y1: 224, y2: 276 },  // first row
            { x1: 53, x2: 36, y1: 294, y2: 344 },  // second row
            // third row
            { y1: 366, y2: 415 },
            { x1: 35, x2: 25, x1Step: 25, x2Step: 35 }
        ];
    }
    update() {
        this.userInput();
        this.clickTime();
        this.render();
    }
    userInput() {
        // check if mouse is hovering over any of the buttons
        canvas.addEventListener('mousemove', (e) => {
            // get x/y mouse coords 
            let rect = canvas.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            // check if mouse hoving over a button 
            let isHovered = false;
            let s = this.bSize;
            for (let i in this.buttons) {
                let p = this.buttons[i].pos;
                if (x >= p.x && x <= p.x + s.x && y >= p.y && y <= p.y + s.y) {
                    this.hoveredButton = this.buttons[i];
                    isHovered = true;
                    break;
                }
            }
            if (!isHovered) {
                this.hoveredButton = { text: null };
            }
        });
        // check if user is clicking on any of the buttons
        canvas.addEventListener('mousedown', (e) => {
            if (!this.click.clicking) {
                let rect = canvas.getBoundingClientRect();
                let x = e.clientX - rect.left;
                let y = e.clientY - rect.top;
                // reset click time
                this.click.clicking = true;
                this.click.start = new Date().getTime();
                // check if any of the buttons are being clicked
                if (this.hoveredButton) {
                    // perform single q-learning iteration
                    if (this.hoveredButton.text === "Single Iteration") {
                        this.ai.qLearningIteration();
                    }
                    // perform 1,000 q-learning iterations
                    else if (this.hoveredButton.text === "1,000 Iterations") {
                        for (let i = 0; i < 1000; i++) {
                            this.ai.qLearningIteration();
                        }
                    }
                    // perform 1,000,000 q-learning iterations
                    else if (this.hoveredButton.text === "1,000,000 Iterations") {
                        for (let i = 0; i < 1000000; i++) {
                            this.ai.qLearningIteration();
                        }
                    }
                    else if (this.hoveredButton.text === "View Policy") {
                        this.showValue = false;
                    }
                    else if (this.hoveredButton.text === "View Value") {
                        this.showValue = true;
                    }
                    else if (this.hoveredButton.text === "Show Instructions") {
                        instructions.style.display = 'flex';
                        cContainer.style.display = 'none';
                    }
                }
            }
        });
    }

    drawTriangle(row, column) {
        let lineInfo = Object.assign({}, this.lines[row - 1]);
        let offsetTop = 0;
        let offsetBottom = 0;
        let offsetBottom2 = 0;
        if (row === 1) {
            offsetTop = 150 * column;
            offsetBottom = 150 * column;
            offsetBottom2 = 40;
        } 
        else {
            offsetTop = 150 * column;
            offsetBottom = 150 * column;
            offsetBottom2 = 25;
        }
        this.ctx.beginPath();
        this.ctx.moveTo(lineInfo.x1 + offsetTop, lineInfo.y1);
        this.ctx.lineTo(lineInfo.x2 + offsetBottom,  lineInfo.y2);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(lineInfo.x1 + offsetTop, lineInfo.y1);
        this.ctx.lineTo(lineInfo.x2 + offsetBottom + offsetBottom2,  lineInfo.y2);
        this.ctx.stroke();
        if (row === 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(lineInfo.x1 + offsetTop + 40, lineInfo.y1);
            this.ctx.lineTo(lineInfo.x2 + offsetBottom + 50,  lineInfo.y2);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(lineInfo.x1 + offsetTop + 40, lineInfo.y1);
            this.ctx.lineTo(lineInfo.x2 + offsetBottom + offsetBottom2 + 50,  lineInfo.y2);
            this.ctx.stroke();
        }
    }

    drawLines(col) {
        let lX = this.lines[3];
        let lY = this.lines[2];
        let offset = 150 * col;
        for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(lX.x1 + offset + i * lX.x1Step, lY.y1);
            this.ctx.lineTo(lX.x2 + offset + i * lX.x2Step, lY.y2);
            this.ctx.stroke();
        }

    }

    clickTime() {
        if (this.click.clicking) {
            let t = new Date().getTime();
            if (t - this.click.start >= this.click.time) {
                this.click.clicking = false;
            }
        }
    }
    renderInstructions() {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.font = "11px Verdana";
        this.fillStyle = "black";
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // draw the next frame
    render() {
        // clear previous frame to start a new
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.font = "11px Verdana";
        // draw a green background
        this.ctx.fillStyle = "green";
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        // draw the UI buttons
        for (let i in this.buttons) {
            this.ctx.fillStyle = (this.buttons[i].text === this.hoveredButton.text) ? "black" : "orange";
            this.ctx.fillRect(this.buttons[i].pos.x, this.buttons[i].pos.y, this.bSize.x, this.bSize.y);
            this.ctx.fillStyle = (this.buttons[i].text === this.hoveredButton.text) ? "orange" : "black";
            this.ctx.fillText(this.buttons[i].text, this.buttons[i].pos.x + 2, this.buttons[i].pos.y + 15);
        }
        // draw headings/title
        this.ctx.font = "15px Verdana"
        this.ctx.fillStyle = '#CCC';
        for (let i in this.headings) {
            this.ctx.fillText(this.headings[i].text, this.headings[i].pos.x, this.headings[i].pos.y);
        }
        // draw current wins / losses / draws 
        for (let i in this.stats) {
            let stat = (this.stats[i].text === "  Wins: ") ? this.ai.stats.wins 
            : (this.stats[i].text === "Losses: ") ? this.ai.stats.losses
            : (this.stats[i].text === " Draws: ") ? this.ai.stats.draws
            : this.ai.totalIterations;
            this.ctx.fillText(this.stats[i].text + " " + stat, this.stats[i].pos.x, this.stats[i].pos.y);
        }
        // draw lines to connect state space / make more readable
        for (let i = 0; i < 16 ; i++) {
            let row = (i < 8) ? 1 : 2;
            let col = (row === 1) ? i : i - 8;
            this.drawTriangle(row, col);
        }
        for (let i = 0; i < 8; i++) {
            this.drawLines(i);
        }
        // draw current policy/value at each state
        let step = 150;
        // draw player sum states
        for (let i = 0; i < 8; i++) {
            this.ctx.fillStyle = (i % 2 === 0) ? '#AAA' : '#FFF';
            this.ctx.fillRect(this.pSumsPos.x + (i * step), this.pSumsPos.y, this.pSumsSize.x, this.pSumsSize.y);
            this.ctx.fillStyle = 'black';
            this.ctx.fillText(i + 13, this.pSumsPos.x + (i * step) + 5, this.pSumsPos.y + 17);
            // draw soft ace states "T" = holds an ace, "F" = no ace
            for (let j = -1; j < 1; j++) {
                this.ctx.fillStyle = (i % 2 === 0) ? '#AAA' : '#FFF';
                this.ctx.fillRect(this.pSumsPos.x + (i * step) + (j * 40) + 20, this.pSumsPos.y + 70, this.pSumsSize.x - 10, this.pSumsSize.y);
                this.ctx.fillStyle = 'black';
                let text = (j === 0) ? 'F' : 'T';
                this.ctx.fillText(text, this.pSumsPos.x + (i * step) + (j * 40) + 26, this.pSumsPos.y + 70 + 17);
                // draw actions "H" = "Hit", "S" = "Stick"
                for (let k = -2; k < 2; k++) {
                    this.ctx.fillStyle = (i % 2 === 0) ? '#AAA' : '#FFF';
                    this.ctx.fillRect(this.pSumsPos.x + (i * step) + (k * 25) + 15, this.pSumsPos.y + 140, this.pSumsSize.x - 15, this.pSumsSize.y);
                    this.ctx.fillStyle = 'black';
                    let text = (k % 2 === 0) ? "H" : "S";
                    this.ctx.fillText(text, this.pSumsPos.x + (i * step) + (k * 25) + 19, this.pSumsPos.y + 17 + 140);
                }
                for (let k = -2; k < 2; k++) {
                    this.ctx.fillStyle = (i % 2 === 0) ? '#AAA' : '#FFF';
                    this.ctx.fillRect(this.pSumsPos.x + (i * step) + (k * 35) + 15, this.pSumsPos.y + 210, this.pSumsSize.x - 2, this.pSumsSize.y);
                    this.ctx.fillStyle = 'black';
                    let ace = (k < 0) ? 1 : 0;
                    let action = (k % 2 === 0) ? 1 : 0;
                    let offset = 15;
                    if (this.showValue) {
                        text = this.ai.q[i + 13][ace][action];
                        text = text.toFixed(1);
                    }
                    else {
                        text = this.ai.p[i + 13][ace][action];
                        offset = 22;
                    }
                    this.ctx.fillText(text, this.pSumsPos.x + (i * step) + (k * 35) + offset, this.pSumsPos.y + 17 + 210);
                }
            }
        }
    }
}