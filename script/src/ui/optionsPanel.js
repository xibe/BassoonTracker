UI.OptionsPanel = function(){

	var me = UI.panel();
	me.hide();

	var background = UI.scale9Panel(0,0,20,20,UI.Assets.panelMainScale9);
	background.ignoreEvents = true;
	me.addChild(background);

	var mainLabel = UI.label({
		label: "Options:",
		font: fontMed,
		left: 5,
		height: 18,
		top: 9,
		width: 200
	});
	me.addChild(mainLabel);

	//var insetPanel = UI.scale9Panel(0,0,0,0,UI.Assets.panelInsetScale9);
	//me.addChild(insetPanel);

	var closeButton = UI.Assets.generate("button20_20");
	closeButton.setLabel("x");
	closeButton.onClick = function(){
        App.doCommand(COMMAND.showTopMain);
	};
	me.addChild(closeButton);

	var options = [
		{
			label: "Keyboard Layout",
            labels : [
                {width: 56, label: "Keyboard"},
                {width: 110, label: "Keyboard Layout"}
            ],
			values: ["QWERTY","AZERTY","QWERTZ"],
			setValue:function(index){
				if (index == 0){
					SETTINGS.keyboardTable = "qwerty";
				}if (index == 1){
					SETTINGS.keyboardTable = "azerty";
				}else{
					SETTINGS.keyboardTable = "qwertz";
				}
				Settings.saveSettings();
			},
			getValue:function(){
				var result = 0;
				if (SETTINGS.keyboardTable == "azerty") result = 1;
				if (SETTINGS.keyboardTable == "qwertz") result = 2;
				return result;
			}
		},
		{
			label: "VU bars",
			values: ["NONE", "COLOURS: AMIGA","TRANSPARENT"],
			setValue: function (index) {
				if (index == 0){
					SETTINGS.vubars = "none";
				}else if (index == 2){
					SETTINGS.vubars = "trans";
				}else{
					SETTINGS.vubars = "colour";
				}
				Settings.saveSettings();
			},
			getValue: function () {
				var result = 1;
				if (SETTINGS.vubars == "none") result = 0;
				if (SETTINGS.vubars == "trans") result = 2;
				return result;
			}
		},
        {
            label: "Screen refresh",
            labels : [
                {width: 56, label: "Screen"},
                {width: 100, label: "Screen refresh"}
            ],
            values: ["Smooth", "Normal", "Economical" , "Low CPU"],
            setValue: function (index) {
				UI.skipFrame(index);
                Settings.saveSettings();
            },
            getValue: function () {
                return UI.getSkipFrame();
            }
        },
		{
			label: "Stereo",
			values: ["Hard: Amiga", "Balanced", "None: mono"],
			setValue: function (index) {
				if (index == 0){
					Audio.setStereoSeparation(STEREOSEPARATION.FULL)
				}else if (index == 2){
					Audio.setStereoSeparation(STEREOSEPARATION.NONE)
				}
				else{
					Audio.setStereoSeparation(STEREOSEPARATION.BALANCED)
				}
				Settings.saveSettings();
			},
			getValue: function () {
				var result = 1;
				if (SETTINGS.stereoSeparation == STEREOSEPARATION.NONE) result = 2;
				if (SETTINGS.stereoSeparation == STEREOSEPARATION.FULL) result = 0;
				return result;
			}
		},
		{
			label: "Frequency table",
            labels : [
                {width: 56, label: "Frequency"},
                {width: 110, label: "Frequency table"}
            ],
			values: ["Linear", "Amiga periods"],
			setValue: function (index) {
                Tracker.useLinearFrequency = index === 0;
			},
			getValue: function () {
				return Tracker.useLinearFrequency ? 0 : 1;
			}
		},
		{
			label: "Dropbox: existing file",
            labels : [
                {width: 20, label: "Dropbox"},
                {width: 80, label: "Dropbox save"},
                {width: 160, label: "Dropbox existing file"}
            ],
			values: ["Rename", "Overwrite"],
			setValue: function (index) {
				if (index === 0){
					SETTINGS.dropboxMode = "rename";
				}else{
					SETTINGS.dropboxMode = "overwrite";
				}
				Settings.saveSettings();
			},
			getValue: function () {
				var result = 0;
				if (SETTINGS.dropboxMode === "overwrite") result = 1;
				return result;
			}
		}
	];


	options.forEach(function(option){


        var labelBox = UI.scale9Panel(0,0,20,20,UI.Assets.panelDarkGreyScale9);
        labelBox.ignoreEvents = true;
        me.addChild(labelBox);


		var label = UI.label();
		label.setProperties({
			label: option.label,
			labels: option.labels,
			font: fontSmall,
			textAlign: "center"
		});
		me.addChild(label);
		option.labelBox = labelBox;
		option.label = label;

		var buttons = [];
		var selectedIndex = option.getValue();

		for (var i = 0; i<option.values.length; i++){
			var value = option.values[i];
			var button;
			if (value){
				button = UI.Assets.generate("buttonKey");
				button.setProperties({
					label: value
				});
				button.setActive(i==selectedIndex);
				button.index = i;
				button.option = option;
				button.onClick = function(){
					if (this.isDisabled) return;
					activateOption(this);
				}
			}

			me.addChild(button);
			buttons.push(button);
		}
		option.buttons = buttons;
	});

	activateOption = function(button){
		var option = button.option;

		option.buttons.forEach(function(child){
			child.setActive(false);
		});
		button.setActive(true);
		option.setValue(button.index)
	};


    me.onShow = function(){
        me.onResize();
    };

	me.onResize = function(){

        if(!me.isVisible())return;

		me.clearCanvas();

		background.setProperties({
			left: 0,
			top: 0,
			height: me.height,
			width: me.width
		});

		var startTop = 5;
		var innerHeight = me.height-(Layout.defaultMargin*2) - startTop;

		closeButton.setProperties({
			top: startTop,
			left: me.width - 30
		});

		/*insetPanel.setProperties({
			left: me.left + Layout.defaultMargin,
			top: me.top + startTop,
			height: innerHeight - 6 - mainLabel.height,
			width: me.width - (Layout.defaultMargin*2) - 4
		});*/

		var optionTops = [27,103];
		var optionHeight = 26;
		var buttonHeight = 20;
		var col=0;
		var row=0;
		var useMultipleRows = false;

		var maxVisible = options.length;
		var maxCols = options.length;
		if (me.width < 600){
			//maxVisible = 3;
            useMultipleRows = true;
            optionTops = [27,103];
            optionHeight = 18;
            buttonHeight = 18;
            maxCols = 4;
        }

		var bWidth = Math.floor(( me.width - Layout.defaultMargin*(maxCols+1)) / maxCols);

		options.forEach(function(option,index){
			//var thisLeft = Layout["col3"+(i+1)+"X"];

			var thisLeft = Layout.defaultMargin + (col*(bWidth+Layout.defaultMargin));
			var thisTop =  optionTops[row];

			if (index>=maxVisible) thisLeft = me.width + 100;

            option.labelBox.setProperties({
                top: thisTop,
                width: bWidth,
                height: optionHeight,
                left: thisLeft
			});

			option.label.setProperties({
				top: thisTop+3,
				_width: Layout.col31W,
				width: bWidth,
				height: optionHeight,
				left: thisLeft+2
			});
			var selectedIndex = option.getValue();

			for (var b = 0; b<option.buttons.length; b++){
				var button = option.buttons[b];
				button.setProperties({
					top: thisTop + (b*buttonHeight) + optionHeight,
					height: buttonHeight,
					width: bWidth,
					left: thisLeft
				});

				button.setActive(b === selectedIndex);
			}

            col++;
			if (useMultipleRows && col>=4) {
				col=0;
				row++;
            }

		});


	};

    EventBus.on(EVENT.songPropertyChange,function(){
        if (me.isVisible()){
        	me.onResize();
		}
    });

    EventBus.on(EVENT.trackerModeChanged,function(){

        if (options[3].buttons && options[3].buttons.length){
            options[3].buttons.forEach(function(button){
            	button.setDisabled(!Tracker.inFTMode());
            });
		}

		if (options[2].buttons && options[2].buttons.length){
			options[2].buttons.forEach(function(button){
				button.setDisabled(Tracker.inFTMode());
			});
		}

        if (me.isVisible()){
            me.onResize();
        }
    });

	return me;

};

