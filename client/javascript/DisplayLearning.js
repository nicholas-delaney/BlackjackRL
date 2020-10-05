class DisplayLearning {
    constructor() {
        this.ctx = canvas.getContext("2d");
        this.ai = new BlackjackRL();
        this.headings = [];
        this.title =              { pos: { x: 300, y: 20 }, text: "Blackjack Reinforment Learning" };
        this.qIterationsHeading = { pos: { x: 5, y: 40 }, text: "Perform Q-learning iterations:" };
        this.viewStatsHeading =   { pos: { x: 350, y: 60}, text: "View State Stats" };
        this.buttons = [];
        this.bSize = {x: 120, y: 25 };
        this.singleQIteration =   { pos: { x: 40, y: 50 },  text: "Single Iteration" };
        this.thousandQIteration = { pos: { x: 40, y: 90 },  text: "1,000 Iterations" };
        this.hundredThousandQIteration =  { pos: { x: 40, y: 130 }, text: "100,000 Iterations"  };
        this.viewPolicy        =  { pos: { x: 290, y: 70 }, text: "View Policy" }; 
        this.viewValue         =  { pos: { x: 420, y: 70 }, text: "View Value" };
        this.stats = [];
        this.wins =   { pos: { x: 572, y: 50 }, text: "  Wins: " };
        this.losses = { pos: { x: 570, y: 70 }, text: "Losses: "};
        this.draws =  { pos: { x: 568, y: 90 }, text: " Draws: "};
        this.parameters = [];
        this.epsilon = {};
        this.alpha = {};
        this.gamma = {};
        this.states = []
        this.pSums = [];
        this.pSumsPos =  { x: 40, y: 200 };
        this.pSumsSize = { x: 25, y: 25 };
        this.hasAce = [];
        this.hasAcePos = { pos: {x: 5, y: 200 } };
        this.hasAceSize = { x: 25, y: 40 };
        this.hoveredButton = { text: null };
        this.showValue = false;
        this.click = {
            clicking: false,
            start: 0,
            time: 200
        }
        this.init();
    }
    init() {
        this.buttons = [ this.singleQIteration, this.thousandQIteration, this.hundredThousandQIteration, this.viewPolicy, this.viewValue ];
        this.headings = [ this.title, this.qIterationsHeading, this.viewStatsHeading ];
        this.stats = [ this.wins, this.draws, this.losses ];
        this.parameters = [ this.epsilon, this.alpha, this.gamma ];
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
                    else if (this.hoveredButton.text === "100,000 Iterations") {
                        for (let i = 0; i < 100000; i++) {
                            this.ai.qLearningIteration();
                        }
                    }
                }
            }
        });
    }

    clickTime() {
        if (this.click.clicking) {
            let t = new Date().getTime();
            if (t - this.click.start >= this.click.time) {
                this.click.clicking = false;
            }
        }
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
        // draw stats 
        for (let i in this.stats) {
            this.ctx.fillText(this.stats[i].text, this.stats[i].pos.x, this.stats[i].pos.y);
        }
        // draw states
        let step = 110;
        // draw player sum states
        for (let i = 0; i < 10; i++) {
            this.ctx.fillStyle = '#CCC';
            this.ctx.fillRect(this.pSumsPos.x + (i * step), this.pSumsPos.y, this.pSumsSize.x, this.pSumsSize.y);
            this.ctx.fillStyle = 'black';
            this.ctx.fillText(i + 12, this.pSumsPos.x + (i * step) + 3, this.pSumsPos.y + 17);
            // draw soft ace states "T" = holds an ace, "F" = no ace
            for (let j = -1; j < 1; j++) {
                this.ctx.fillStyle = '#CCC';
                this.ctx.fillRect(this.pSumsPos.x + (i * step) + (j * 40) + 20, this.pSumsPos.y + 75, this.pSumsSize.x, this.pSumsSize.y);
                this.ctx.fillStyle = 'black';
                let text = (j === 0) ? 'F' : 'T';
                this.ctx.fillText(text, this.pSumsPos.x + (i * step) + (j * 40) + 25, this.pSumsPos.y + 75 + 17);
                // draw actions "H" = "Hit", "S" = "Stick"
                for (let k = -2; k < 2; k++) {
                    this.ctx.fillStyle = '#CCC';
                    this.ctx.fillRect(this.pSumsPos.x + (i * step) + (k * 25) + 15, this.pSumsPos.y + 150, this.pSumsSize.x - 5, this.pSumsSize.y);
                    this.ctx.fillStyle = 'black';
                    let text = (k % 2 === 0) ? "H" : "S";
                    this.ctx.fillText(text, this.pSumsPos.x + (i * step) + (k * 25) + 19, this.pSumsPos.y + 17 + 150);
                }
                for (let k = -2; k < 2; k++) {
                    this.ctx.fillStyle = '#CCC';
                    this.ctx.fillRect(this.pSumsPos.x + (i * step) + (k * 25) + 15, this.pSumsPos.y + 200, this.pSumsSize.x - 5, this.pSumsSize.y);
                    this.ctx.fillStyle = 'black';
                    if (!this.showValue) {
                        let ace = (j === 0) ? 0 : 1;
                        let action = (k % 2 === 0) ? 1 : 0;
                        text = this.ai.p[i+12][10][ace][action];
                    }
                    this.ctx.fillText(text, this.pSumsPos.x + (i * step) + (k * 25) + 19, this.pSumsPos.y + 17 + 200);
                }
            }
        }
    }
}