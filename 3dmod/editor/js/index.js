// 'true' para mostrar mensagens de debug
const deb = false;

document.onload = () => {
    toggleMatrixControlButtons();
}

function debug(t) {
    if (deb) console.log(t);
}

function resetMatrix() {
    if(confirm('Resetting the matrix, will remove all elements. Continue?')) {
        const t = getElById('matrix-table');
        setAllCellsToZero(t);
        exitDoorAddMode();
    }
}

function addDoor() {
    let table = getElById('matrix-table');
    let addDoorBtn = getElById('addDoorBtn');
    let exitAddDoorBtn = getElById('exitAddDoorBtn');
    addClassToAllMatrixCells(table, 'cellAddDoor');
    exitAddDoorBtn.style.visibility = "visible";
    addDoorBtn.style.visibility = "hidden";
}

function exitDoorAddMode() {
    let table = getElById('matrix-table');
    let addDoorBtn = getElById('addDoorBtn');
    let exitAddDoorBtn = getElById('exitAddDoorBtn');
    removeClassToAllMatrixCells(table, 'cellAddDoor');
    exitAddDoorBtn.style.visibility = "hidden";
    addDoorBtn.style.visibility = "visible";
}

function addClassToAllMatrixCells(table, className) {
    if (table && table.tagName === 'TABLE') {
        for (let i = 0; i < table.rows.length; i++) {
            for (let j = 0; j < table.rows[i].cells.length; j++) {
                table.rows[i].cells[j].classList.add(className);
            }
        }
    } else {
        console.error('The provided element is not a table.');
    }
}

function removeClassToAllMatrixCells(table, className) {
    if (table && table.tagName === 'TABLE') {
        for (let i = 0; i < table.rows.length; i++) {
            for (let j = 0; j < table.rows[i].cells.length; j++) {
                table.rows[i].cells[j].classList.remove(className);
            }
        }
    } else {
        console.error('The provided element is not a table.');
    }
}

function setAllCellsToZero(table) {
    if (table && table.tagName === 'TABLE') {
        for (let i = 0; i < table.rows.length; i++) {
            for (let j = 0; j < table.rows[i].cells.length; j++) {
                setCellColor(table.rows[i].cells[j].id, 0);
                table.rows[i].cells[j].textContent = 0;
            }
        }
    } else {
        console.error('The provided element is not a table.');
    }
}

function toggleMatrixControlButtons() {
    const m = getElById('matrix');
    if (m.innerHTML != '' || m.innerHTML != undefined) {
        const resetBtn = getElById('resetMatrixBtn');
        const addDoorBtn = getElById('addDoorBtn');
        resetBtn.style.visibility = 'visible';
        addDoorBtn.style.visibility = 'visible';
    }
}

function setHtml(elementOrId, text) {
    // Check if elementOrId is a string, if so, try to get the element by ID
    var element = (typeof elementOrId === 'string') ? getElById(elementOrId) : elementOrId;

    // Check if the element is found and is an input field
    if (element && element.tagName === 'INPUT' && element.type === 'text') {
        element.value = text;
    } else {
        console.error('The provided element is not a text input field.');
    }
}

function setCellColor(cellId, t) {
    let c = getElById(cellId);
    c.classList.remove('cellTop', 'cellLeft', 'cellTopLeft', 'doorLeft', 'doorTop');
    switch (t) {
        case "1":
            c.classList.add('cellLeft');
            break;
        case "2":
            c.classList.add('cellTop');
            break;
        case "3":
            c.classList.add('cellTopLeft');
            break;
        case "4":
            c.classList.add('doorLeft');
            break;
        case "5":
            c.classList.add('doorTop');
            break;
        case "0":
        default:
            c.classList.remove('cellTopLeft', 'cellLeft', 'cellTop', 'doorLeft', 'doorTop');
    }
}

function cellClick(event, action) {
    if(event.target.classList.contains('cellAddDoor')) {
        action = 'door';
    }
    let c = getElById(event.target.id);
    let v = Number(c.innerHTML);
    switch(action) {
        case 'inc':
            (v < 3) ? v++ : '';
            break;
        case 'dec':
            (v > 0) ? v-- : '';
            break;
        case 'door':
            if( v == 0) {
                v = 4;
            } else if(v == 4){
                v = 5;
            } else {
                v = 0;
            }
    }
    c.innerHTML = v;
    setCellColor(event.target.id, String(v));
}

function createTableFromMatrix(matrix) {
    var table = document.createElement('table');
    table.id = 'matrix-table';
    table.classList.add('table');
    for (var i = 0; i < matrix.length; i++) {
        var row = document.createElement('tr');
        for (var j = 0; j < matrix[0].length; j++) {
            var cell = document.createElement('td');
            cell.id = 'cell-' + i + '-' + j;
            cell.textContent = matrix[i][j];
            cell.classList.add('cellNormal');
            cell.addEventListener('click', function (event) {
                cellClick(event, 'inc');
            });
            cell.addEventListener('contextmenu', function (event) {
                event.preventDefault();
                cellClick(event, 'dec');
            });
            row.appendChild(cell);
            if (i == matrix.length - 1 || j == matrix[i].length - 1) {
                cell.style.background = '#3d3d3d22';
            }
        }
        table.appendChild(row);
    }
    return table;
}

function setTableConfigColors(table) {
    if (!(table instanceof HTMLTableElement)) {
        console.error("Provided element is not an HTMLTableElement.");
        return;
    }

    for (let row of table.rows) {
        for (let cell of row.cells) {
            setCellColor(cell.id, cell.innerHTML);
        }
    }
}

function setNewMatrixSize() {
    const mazeWidth = getElById('mazeWidth').value;
    const mazeDepth = getElById('mazeDepth').value;
    let floorWidth = getElById('groundSizeWidth');
    let floorDepth = getElById('groundSizeDepth');

    floorWidth.value = mazeWidth;
    floorDepth.value = mazeDepth;

    var matrix = [];
    for (var i = 0; i <= mazeDepth; i++) {
        var row = [];
        for (var j = 0; j <= mazeWidth; j++) {
            row.push(0);
        }
        matrix.push(row);
    }
    const newMatrix = createTableFromMatrix(matrix);
    let m = getElById('matrix');
    m.innerHTML = '';
    m.appendChild(newMatrix);
}

function loadFile() {
    const input = getElById('fileInput');
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            try {
                const jsonObj = JSON.parse(event.target.result);
                debug(jsonObj);
                //console.log(jsonObj.maze.map); return;
                const table = createTableFromMatrix(jsonObj.maze.map);
                let m = getElById('matrix');
                m.innerHTML = '';
                m.appendChild(table);
                table.classList.add('table', 'table-responsive', 'table-dark', 'text-secondary', 'text-center')
                setTableConfigColors(table);
                toggleMatrixControlButtons();

                // maze
                setHtml('mazeDepth', jsonObj.maze.size.depth);
                setHtml('mazeWidth', jsonObj.maze.size.width);
                setHtml('exitLocation', jsonObj.maze.exitLocation.join([separator = ',']));

                // ground
                setHtml('groundSizeHeight', jsonObj.ground.size.height);
                setHtml('groundSizeWidth', jsonObj.ground.size.width);
                setHtml('groundSizeDepth', jsonObj.ground.size.depth);
                setHtml('groundSegmentsWidth', jsonObj.ground.segments.height);
                setHtml('groundSegmentsHeight', jsonObj.ground.segments.width);
                setHtml('groundSegmentsDepth', jsonObj.ground.segments.depth);
                setHtml('groundPrimaryColor', jsonObj.ground.primaryColor);
                setHtml('groundSecondaryColor', jsonObj.ground.secondaryColor);
                setHtml('mapsColorUrl', jsonObj.ground.maps.color.url);
                setHtml('mapsAoUrl', jsonObj.ground.maps.ao.url);
                setHtml('mapsAoIntensity', jsonObj.ground.maps.ao.intensity);
                setHtml('displacementUrl', jsonObj.ground.maps.displacement.url);
                setHtml('displacementScale', jsonObj.ground.maps.displacement.scale);
                setHtml('displacementBias', jsonObj.ground.maps.displacement.bias);
                setHtml('normalUrl', jsonObj.ground.maps.normal.url);
                setHtml('normalType', jsonObj.ground.maps.normal.type);
                setHtml('normalScaleX', jsonObj.ground.maps.normal.scale.x);
                setHtml('normalScaleY', jsonObj.ground.maps.normal.scale.y);
                setHtml('bumpUrl', jsonObj.ground.maps.bump.url);
                setHtml('bumpScale', jsonObj.ground.maps.bump.scale);
                setHtml('roughnessUrl', jsonObj.ground.maps.roughness.url);
                setHtml('roughnessRough', jsonObj.ground.maps.roughness.rough);
                setHtml('wrapS', jsonObj.ground.wrapS);
                setHtml('wrapT', jsonObj.ground.wrapT);
                setHtml('repeatU', jsonObj.ground.repeat.u);
                setHtml('repeatV', jsonObj.ground.repeat.v);
                setHtml('magFilter', jsonObj.ground.magFilter);
                setHtml('minFilter', jsonObj.ground.minFilter);

                // wall
                setHtml('wallSegmentsWidth', jsonObj.wall.segments.width);
                setHtml('wallSegmentsHeight', jsonObj.wall.segments.height);
                setHtml('wallPrimaryColor', jsonObj.wall.primaryColor);
                setHtml('wallsecondaryColor', jsonObj.wall.secondaryColor);
                setHtml('wallMapsColorUrl', jsonObj.wall.maps.color.url);
                setHtml('wallMapsAoUrl', jsonObj.wall.maps.ao.url);
                setHtml('wallMapsAoIntensity', jsonObj.wall.maps.ao.intensity);
                setHtml('walldisplacementUrl', jsonObj.wall.maps.displacement.url);
                setHtml('walldisplacementScale', jsonObj.wall.maps.displacement.scale);
                setHtml('walldisplacementBias', jsonObj.wall.maps.displacement.bias);
                setHtml('wallnormalUrl', jsonObj.wall.maps.normal.url);
                setHtml('wallnormalType', jsonObj.wall.maps.normal.type);
                setHtml('wallnormalScaleX', jsonObj.wall.maps.normal.scale.x);
                setHtml('wallnormalScaleY', jsonObj.wall.maps.normal.scale.y);
                setHtml('wallbumpUrl', jsonObj.wall.maps.bump.url);
                setHtml('wallbumpScale', jsonObj.wall.maps.bump.scale);
                setHtml('wallroughnessUrl', jsonObj.wall.maps.roughness.url);
                setHtml('wallroughnessRough', jsonObj.wall.maps.roughness.rough);
                setHtml('wallwrapS', jsonObj.wall.wrapS);
                setHtml('wallwrapT', jsonObj.wall.wrapT);
                setHtml('wallrepeatU', jsonObj.wall.repeat.u);
                setHtml('wallrepeatV', jsonObj.wall.repeat.v);
                setHtml('wallmagFilter', jsonObj.wall.magFilter);
                setHtml('wallminFilter', jsonObj.wall.minFilter);


                // player
                setHtml('playerInitialPosition', jsonObj.player.initialPosition.join([separator = ',']));
                setHtml('playerInitialDirection', jsonObj.player.initialDirection);
            } catch (e) {
                alert('Error parsing JSON:', e);
            }
        };

        reader.onerror = function (event) {
            alert('File could not be read! Code ' + event.target.error.code);
        };

        reader.readAsText(file);
    } else {
        alert('No file selected');
    }
}

function canBeConvertedToDouble(str) {
    var num = parseFloat(str);
    if (!isNaN(num) && str.trim() !== "") {
        return num.toString() === str.trim() || num.toString() + ".0" === str.trim();
    }
    return false;
}

function getInputValue(id) {
    const v = getElById(id).value;
    //debug("value is " + v);
    // verifica nulls ou similar
    if (!v) {
        //debug("parsed as null or empty");
        return v
    };
    // verifica hexadecimais
    var hexaRegex = /^0x[0-9a-f]{6}/;
    if (hexaRegex.test(v)) {
        // debug("parsed as hexadecimal");
        return v;
    }
    // verifica se pode ser convertido num número natural
    const vNum = Number(v);
    if (!isNaN(vNum)) {
        //debug("parsed as a natural number");
        return vNum;
    }
    // exclui outros que contenham caracteres não numéricos
    // e verifica se pode ser convertido em float
    var numberRegex = /^[\d]+[\.,]{0,1}[\d]+|[\d]+$/;
    if (numberRegex.test(v)) {
        // verifica se pode ser convertido em float
        if (canBeConvertedToDouble(v)) {
            //debug("parsed as double");
            return parseFloat(v);
        }
    }
    //debug("parsed as string");
    return v;
}

function convertCommaDelimitedStringToNumberArray(str) {
    var stringArray = str.split(',');
    var numberArray = stringArray.map(function (item) {
        return parseFloat(item.trim());
    });
    return numberArray.filter(function (item) {
        return !isNaN(item);
    });
}

function tableToNumberMatrix(tableId) {
    const table = getElById(tableId);
    var matrix = [];
    for (var i = 0; i < table.rows.length; i++) {
        var row = [];
        for (var j = 0; j < table.rows[i].cells.length; j++) {
            var cellValue = table.rows[i].cells[j].textContent;
            var number = parseFloat(cellValue);
            row.push(isNaN(number) ? 0 : number);
        }
        matrix.push(row);
    }
    return matrix;
}

function saveFile() {
    debug("saveFile()");
    const finalJSONObj = {
        "ground": {
            'magFilter': getInputValue('magFilter'),
            'maps': {
                'ao': {
                    'intensity': getInputValue('mapsAoIntensity'),
                    'url': getInputValue('mapsAoUrl')
                },
                'bump': {
                    'scale': getInputValue('bumpScale'),
                    'url': getInputValue('bumpUrl')
                },
                'color': {
                    'url': getInputValue('mapsColorUrl')
                },
                'displacement': {
                    'bias': getInputValue('displacementBias'),
                    'scale': getInputValue('displacementScale'),
                    'url': getInputValue('displacementUrl')
                },
                'normal': {
                    'scale': {
                        'x': getInputValue('normalScaleX'),
                        'y': getInputValue('normalScaleY'),
                    },
                    'type': getInputValue('normalType'),
                    'url': getInputValue('normalUrl')
                },
                'roughness': {
                    'rough': getInputValue('roughnessRough'),
                    'url': getInputValue('roughnessUrl')
                },
            },
            'minFilter': getInputValue('minFilter'),
            'primaryColor': getInputValue('groundPrimaryColor'),
            'repeat': {
                'u': getInputValue('repeatU'),
                'v': getInputValue('repeatV'),
            },
            'secondaryColor': getInputValue('groundSecondaryColor'),
            'segments': {
                'depth': getInputValue('groundSegmentsDepth'),
                'height': getInputValue('groundSegmentsHeight'),
                'width': getInputValue('groundSegmentsWidth'),
            },
            'size': {
                'depth': getInputValue('groundSizeDepth'),
                'height': getInputValue('groundSizeHeight'),
                'width': getInputValue('groundSizeWidth'),
            },
            'wrapS': getInputValue('wrapS'),
            'wrapT': getInputValue('wrapT'),
        },
        "maze": {
            'exitLocation': convertCommaDelimitedStringToNumberArray(getInputValue('exitLocation')),
            'map': tableToNumberMatrix('matrix-table'),
            'size': {
                'depth': getInputValue('mazeDepth'),
                'width': getInputValue('mazeWidth'),
            }
        },
        "player": {
            'initialDirection': getInputValue('playerInitialDirection'),
            'initialPosition': convertCommaDelimitedStringToNumberArray(getInputValue('playerInitialPosition')),
        },
        "wall": {
            'magFilter': getInputValue('wallmagFilter'),
            'maps': {
                'ao': {
                    'intensity': getInputValue('wallMapsAoIntensity'),
                    'url': getInputValue('wallMapsAoUrl'),
                },
                'bump': {
                    'scale': getInputValue('wallbumpScale'),
                    'url': getInputValue('wallbumpUrl'),
                },
                'color': {
                    'url': getInputValue('wallMapsColorUrl'),
                },
                'displacement': {
                    'bias': getInputValue('walldisplacementBias'),
                    'scale': getInputValue('walldisplacementScale'),
                    'url': getInputValue('walldisplacementUrl'),
                },
                'normal': {
                    'scale': {
                        'x': getInputValue('wallnormalScaleX'),
                        'y': getInputValue('wallnormalScaleY'),
                    },
                    'type': getInputValue('wallnormalType'),
                    'url': getInputValue('wallnormalUrl'),
                },
                'roughness': {
                    'rough': getInputValue('wallroughnessRough'),
                    'url': getInputValue('wallroughnessUrl'),
                }
            },
            'minFilter': getInputValue('wallminFilter'),
            'primaryColor': getInputValue('wallPrimaryColor'),
            'repeat': {
                'u': getInputValue('wallrepeatU'),
                'v': getInputValue('wallrepeatV'),
            },
            'secondaryColor': getInputValue('wallsecondaryColor'),
            'segments': {
                'height': getInputValue('wallSegmentsHeight'),
                'width': getInputValue('wallSegmentsWidth'),
            },
            'wrapS': getInputValue('wallwrapS'),
            'wrapT': getInputValue('wallwrapT'),
        },
    }
    const exportedFileName = "output.JSON";
    saveJsonToFile(finalJSONObj, exportedFileName);
}

function saveJsonToFile(jsonObject, filename) {
    var jsonString = JSON.stringify(jsonObject);
    var blob = new Blob([jsonString], { type: "application/json" });
    var a = document.createElement("a");
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function getElById(id) {
    return document.getElementById(id);
}