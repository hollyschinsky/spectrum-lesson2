import React, { useState, useRef } from "react";
import "./App.css";
import {WC} from "./WC.jsx";


// To support: theme="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/styles/typography.css";
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";
import "@spectrum-web-components/theme/scale-medium.js";
import "@spectrum-web-components/theme/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Button } from "@swc-react/button";
import { Theme } from "@swc-react/theme";
// STEP 2
import { ButtonGroup } from '@swc-react/button-group';
import { FieldLabel } from '@swc-react/field-label';
import { MenuItem } from '@swc-react/menu';
import { Picker } from '@swc-react/picker';
import { Slider } from '@swc-react/slider';
import { Swatch } from '@swc-react/swatch';
import { Switch } from "@swc-react/switch";

const App = ({ addOnUISdk }) => {
    let usedNums = new Array(76);
    const [bgColor, setBgColor] = useState("#E6E6E6");
    const [bgColorSwatch, setBgColorSwatch] = useState("#E6E6E6");
    const [fgColor, setFgColor] = useState("#3e3f3f");
    const [fgColorSwatch, setFgColorSwatch] = useState("#3e3f3f");
    const [titleColor, setTitleColor] = useState("#555BE7");
    const [titleColorSwatch, setTitleColorSwatch] = useState("#555BE7");

    const [fontWeightPicker, setFontWeightPicker] = useState("normal");
    const [freeSpaceToggle, setFreeSpaceToggle] = useState(false);

    const [gridlineSize, setGridlineSize] = useState(5);
    const [gridColor, setGridColor] = useState("#555BE7");
    const [gridColorSwatch, setGridColorSwatch] = useState("#555BE7");
    
    // Reference to the hidden color picker input elements
    const fgColorInput = useRef(null);
    const bgColorInput = useRef(null);
    const gridColorInput = useRef(null);
    const titleColorInput = useRef(null);

    const addBtn = useRef(null);
    const finalCardCanvas = useRef(null);
    
    function generateBingoCard() {              
        const ctx = finalCardCanvas.current.getContext("2d");

        // Set canvas width and height
        finalCardCanvas.current.width = 300;
        finalCardCanvas.current.height = 360;
        
        // Set grid properties            
        const numRows = 6;
        const numCols = 5;
        const cellWidth = 60;
        const cellHeight = 60;
                        
        // Fill background boxes with selected bg color
        ctx.fillStyle = bgColor; 
        for (let x = gridlineSize/2; x <= finalCardCanvas.current.width; x += cellWidth-gridlineSize) {            
            for (let y = gridlineSize/2; y <= finalCardCanvas.current.height; y += cellHeight-gridlineSize) {
                ctx.fillRect(x, y, cellWidth-gridlineSize, cellHeight-gridlineSize);
            }
        }                        
        
        // Draw gridlines
        ctx.lineWidth = gridlineSize; 
        for (let i = 0; i <= numCols; i++) {        
            // Need to adjust for left/right gridlines size
            ctx.moveTo(gridlineSize/2, 0);
            ctx.lineTo(gridlineSize/2, finalCardCanvas.current.height);      

            ctx.moveTo(i * cellWidth-gridlineSize/2, 0);
            ctx.lineTo(i * cellWidth-gridlineSize/2, finalCardCanvas.current.height);            
        }

        for (let i = 0; i <= numRows; i++) { 
            // Need to adjust for top/bottom gridlines size               
            ctx.moveTo(0, gridlineSize/2);
            ctx.lineTo(finalCardCanvas.current.height, gridlineSize/2,);            
        
            ctx.moveTo(0, i * cellWidth-gridlineSize/2);
            ctx.lineTo(finalCardCanvas.current.height, i * cellWidth-gridlineSize/2);                    
        }
                
        ctx.strokeStyle = gridColor; // Gridline color
        ctx.stroke();
                            
        // Draw bingo title
        ctx.font = fontWeightPicker +' 28px adobe clean';    
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle'; 
                
        ctx.fillStyle = titleColor; // title font color                       
        let bingoTitle = ['B','I','N','G','O'];
        for (let charCnt = 0; charCnt < bingoTitle.length; charCnt++) {
            let letter = bingoTitle[charCnt];
            ctx.fillText(letter, charCnt * cellWidth + cellWidth / 2, cellHeight / 2 + 6);                
        }       
        
        // Fill in the card with random numbers and free space if checked
        const freeSpace = [3, 2]; // Coordinates of the FREE space
        const numbers = [];
        const usedNumbers = new Set(); // Track used numbers
        ctx.font = fontWeightPicker +' 22px adobe clean';
        ctx.fillStyle = fgColor; // color of the foreground (numbers)         
        const freeSpaceToggle = document.getElementById("freeSpaceToggle");
        
        for (let i = 1; i < numRows; i++) {
            numbers[i] = [];
            for (let j = 0; j < numCols; j++) {
                if (freeSpaceToggle.checked) {
                    if (i === freeSpace[0] && j === freeSpace[1]) {
                        numbers[i][j] = "FREE";
                        continue; // Skip the FREE space
                    }
                }

                let num;
                do {
                    num = Math.floor(Math.random() * 15) + 1 + (j * 15);
                } while (usedNumbers.has(num)); // Generate unique numbers

                usedNumbers.add(num);
                numbers[i][j] = num;        
                ctx.fillText(num, j * cellWidth + cellWidth / 2 - 3, i * cellHeight + cellHeight / 2 + 3);                
            }
        }
                
        // Draw "FREE" on the FREE space if the toggle is on
        if (freeSpaceToggle.checked) {
            ctx.font = fontWeightPicker +' 20px adobe clean';     
            ctx.fillText("FREE", freeSpace[1] * cellWidth + cellWidth / 2 - 3, freeSpace[0] * cellHeight + cellHeight / 2 + 3);   
            ctx.drawImage(canvas, 0, 0);
        }    
            
        // Enable drag and drop
        addOnUISdk.app.enableDragToDocument(finalCardCanvas.current, {
            previewCallback: el => new URL(finalCardCanvas.current.toDataURL()),
            completionCallback: async el => {
                const r = await fetch(finalCardCanvas.current.toDataURL());
                const blob = await r.blob();
                return [{blob}];
            }
        })
            
        // Enable add card button
        addBtn.current.disabled = false;              

        addBtn.current.onclick = async () => {      
            const r = await fetch(finalCardCanvas.current.toDataURL());
            const blob = await r.blob();    
            addOnUISdk.app.document.addImage(blob);  
        }
    }

    function onFgColorChange(e) {        
        setFgColorSwatch(e.target.value);
        setFgColor(e.target.value);        
    }

    function onFgColorClick(e) {
        // Trigger the HTML color picker to open
        fgColorInput.current.click();
    }

    function onBgColorChange(e) {        
        setBgColorSwatch(e.target.value);
        setBgColor(e.target.value);        
    }
    
    function onBgColorClick(e) {
        // Trigger the HTML color picker to open
        bgColorInput.current.click();
    }

    function onTitleColorChange(e) {        
        setTitleColorSwatch(e.target.value);
        setTitleColor(e.target.value);        
    }
    
    function onTitleColorClick(e) {
        // Trigger the HTML color picker to open
        titleColorInput.current.click();
    }

    function onGridColorChange(e) {        
        setGridColorSwatch(e.target.value);
        setGridColor(e.target.value);        
    }
    
    function onGridColorClick(e) {
        // Trigger the HTML color picker to open
        gridColorInput.current.click();
    }

    return (
        // Please note that the below "<Theme>" component does not react to theme changes in Express.
        // You may use "addOnUISdk.app.ui.theme" to get the current theme and react accordingly.
        <Theme theme="express" scale="medium" color="light">        
            <div className="row gap-20"> 
                <div className="column">
                    <FieldLabel for="bgColorSwatch" size="m">Background color</FieldLabel>
                    <WC onChange={onBgColorClick}>
                        <Swatch id="bgColorSwatch" className="color-well" color={bgColorSwatch}></Swatch>
                    </WC>
                    <input ref={bgColorInput} type="color" id="bgColorPicker" style={{display: "none"}}
                        value={bgColor} onChange={onBgColorChange}
                    />
                </div>
                <div className="column">
                    <FieldLabel for="fgColorSwatch" size="m">Number color</FieldLabel>
                    <WC onChange={onFgColorClick}>
                        <Swatch id="fgColorSwatch" className="color-well" color={fgColorSwatch}></Swatch>
                    </WC>
                    <input ref={fgColorInput} type="color" id="fgColorPicker" style={{display: "none"}}
                        value={fgColor} onChange={onFgColorChange}
                    />                        
                </div>                                                       
                <div className="column">
                    <FieldLabel for="titleColorSwatch" size="m">Title color</FieldLabel>
                    <WC onChange={onTitleColorClick}>
                        <Swatch id="titleColorSwatch" className="color-well" color={titleColorSwatch}></Swatch>
                    </WC>
                    <input ref={titleColorInput} type="color" id="titleColorPicker" style={{display: "none"}}
                        value ={titleColor} onChange={onTitleColorChange}
                    />                    
                </div>                                
            </div>
            <div className="row gap-20">
                <div className="column margin-top-10">
                    <FieldLabel for="fontWeightPicker">Font Weight</FieldLabel>
                    <Picker id="fontWeightPicker" size="m" value={fontWeightPicker} 
                        change={event => setFontWeightPicker(event.target.value)}>
                        <MenuItem value="normal">Normal</MenuItem>                        
                        <MenuItem value="bold">Bold</MenuItem>                            
                        <MenuItem value="lighter">Lighter</MenuItem>                
                    </Picker>
                </div>  
                <div className="column">
                    <WC onChange={event => setFreeSpaceToggle(event.target.checked)}>
                        <Switch id="freeSpaceToggle" emphasized value={freeSpaceToggle} size="l">Free space</Switch>
                    </WC>
                </div>         
            </div>
            <div className="row gap-20">                                
                <WC onChange={event => setGridlineSize(event.target.value)}>
                    <Slider label="Gridlines size" id="gridlineSize" variant="filled" editable value={gridlineSize}
                        hide-stepper min="1" max="10"
                        format-options='{"style": "unit", "unit": "px"}' step="1">
                    </Slider>
                </WC>                                 
                <div className="column">
                    <FieldLabel for="gridColorSwatch" size="m">Color</FieldLabel>
                    <WC onChange={onGridColorClick}>
                        <Swatch id="gridColorSwatch" className="color-well" color={gridColorSwatch}></Swatch>
                    </WC>
                    <input ref={gridColorInput} type="color" id="gridColorPicker" style={{display: "none"}}
                        value={gridColor} onChange={onGridColorChange}
                    />
                </div>                    
            </div>                 
            <div>
                <ButtonGroup horizontal>
                    <Button id="generateBtn" onClick={event => generateBingoCard(event.target.value)}>Generate card</Button>
                    <Button id="addBtn" ref={addBtn} variant="secondary" disabled>Add to page</Button>
                </ButtonGroup>              
            </div>                
            <div className="margin-top-10">                        
                <canvas id="finalCardCanvas" ref={finalCardCanvas}/>            
            </div>                                         
        </Theme>
    );
};

export default App;