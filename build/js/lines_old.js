


/* The game main class: */

with(Lines_game = function( settings, html_inf ){

    /* Constructor */

    // Save default settings of the game and html ids to link to
    this.settings = settings;
    this.html_inf = html_inf;

    // Create button and other GUI objects:
    this.init_gui();
    // Change html objects according to the settings:
    this.restore_settings();
    // Active page id:
    this.active_page = this.html_inf.field_id;
    // Create info bar object:
    this.create_info_bar();
    // Create field object:
    this.create_field();
    // Restore game from the cookie:
    this.restore_game();
    // Redraw field if it's necessary:
    this.redraw_field();
    // Set the event handlers:
    this.handlers();
}){
    /* Methods */

    prototype.create_info_bar = function(){
        // The game field object:
        this.info_bar = new Info_bar( this.html_inf.info_bar_id, this.html_inf.score_id, this.html_inf.timer_id,
                                      this.settings );
    };

    prototype.create_field = function(){
        // The game field object:
        this.field = new Field( this.html_inf.field_id, this.info_bar, this );
    };

    prototype.init_gui = function(){
        this.gui = {};  // array of gui elements

        // Button, which opens "option" page:
        this.gui[ 'btn_opts' ] = new Button(
            this.html_inf.opt_btn_id, // html id
            "click",                  // Event name
            function( event ){        // Event handler
                var _this = event.data._this;
                _this.restore_settings();             // Restore game settings
                _this.open_page( _this.html_inf.opt_page_id ); // Open "options" page
            },
            { _this : this }       // A map of data that will be passed to the event handler.
        );

        // "at least N balls in row" radio group:
        this.gui[ 'radio_n_in_row' ] = new Radio_group(
            this.html_inf.row_n_name
        );
        // "at least N balls in block" radio group:
        this.gui[ 'radio_n_in_block' ] = new Radio_group(
            this.html_inf.blk_n_name
        );
        // Game "mode" radio group:
        this.gui[ 'radio_game_mode' ] = new Radio_group(
            this.html_inf.mode_name,
            "change",
            function( event ){
                var _this = event.data._this;
                switch( _this.gui[ 'radio_game_mode' ].get_id() ){

                    case "lines":  _this.gui[ 'radio_n_in_row'   ].enable();
                                   _this.gui[ 'radio_n_in_block' ].disable();
                                   break;

                    case "blocks": _this.gui[ 'radio_n_in_row'   ].disable();
                                   _this.gui[ 'radio_n_in_block' ].enable();
                                   break;

                    default:       _this.gui[ 'radio_n_in_row'   ].disable();
                                   _this.gui[ 'radio_n_in_block' ].disable();
                }
            },
            { _this : this }
        );
        // "Balls type" radio group:
        this.gui[ 'radio_balls_type' ] = new Radio_group(
            this.html_inf.balls_type
        );
        // "Zen mode" checkbox:
        this.gui[ 'zen_mode' ] = new Button(
            this.html_inf.zen_mode_id,
            "click",
            function( event ){
                var _this = event.data._this;

                _this.zen_mode();

                if( _this.gui[ 'timer' ].if_checked() ){
                    _this.gui[ 'timer' ].obj.click();
                }

            },
            { _this : this }
        );
        this.gui[ 'timer' ] = new Button(
            this.html_inf.timer_btn_id
        );
        this.gui[ 'next' ] = new Button(
            this.html_inf.next_id
        );
        // "Cancel settings" button:
        this.gui[ 'btn_cancel' ] = new Button(
            this.html_inf.cancel_btn_id,
            "click",
            function( event ){
                var _this = event.data._this;
                _this.restore_settings();
                _this.open_page( _this.html_inf.field_id );
            },
            { _this : this }
        );
        // "Save settings" button:
        this.gui[ 'btn_save' ] = new Button(
            this.html_inf.save_btn_id,
            "click",
            function( event ){
                var _this = event.data._this;
                _this.save_settings();
                _this.open_page( _this.html_inf.field_id );
            },
            { _this : this }
        );
        // Button, which opens "help" page:
        this.gui[ 'btn_help' ] = new Button(
            this.html_inf.hlp_btn_id,
            "click",
            function( event ){
                var _this = event.data._this;
                _this.restore_settings();
                _this.open_page( _this.html_inf.hlp_page_id ); // Open "help" page
            },
            { _this : this }
        );
        // Button, which opens "high score" page:
        this.gui[ 'btn_high_score' ] = new Button(
            this.html_inf.hsc_btn_id,
            "click",
            function( event ){
                var _this = event.data._this;
                if( ! _this.busy && _this.active_page != _this.html_inf.hsc_page_id )
                    _this.load_high_scores();
                _this.open_page( _this.html_inf.hsc_page_id );
            },
            { _this: this }
        );
        // Button, which start new game:
        this.gui[ 'btn_new_game' ] = new Button(
            this.html_inf.restart_btn_id,
            "click",
            function( event ){
                var _this = event.data._this;

                if( _this.future_s ){
                    _this.settings = _this.future_s;
                    _this.field.settings = _this.future_s;
                    _this.info_bar.settings = _this.future_s;
                    _this.update_mode_button();
                }

                var callback_f =
                function( _this ){
                    if( _this.settings.mode <= 1 ){
                        _this.settings.field_size = 7;
                        _this.settings.field_b = 1;
                    }else{
                        _this.settings.field_size = 9;
                        _this.settings.field_b = 0;
                    }
                    _this.redraw_field();
                    _this.field.clear();
                    _this.field.next_round();
                    $.cookie( "game", null );
                    _this.field.game_started = false;
                    _this.info_bar.score2zero( 0 );
                    _this.field.timer_reset();
                    _this.field.timer_stop();
                    _this.stop_game();
                }
                if( _this.active_page != _this.html_inf.field_id ){
                    _this.open_page( _this.html_inf.field_id, callback_f );
                    return true;
                }
                callback_f( _this );
            },
            { _this : this }
        );
        // Button, which toggle game modes:
        this.gui[ 'btn_game_mode' ] = new Button(
            this.html_inf.mode_btn_id,
            "click",
            function( event ){
                var _this = event.data._this;
                _this.field.game_started = false;

                // Update html view:
                var css_pos = "";
                var mode = 0;
                switch( _this.settings.mode ){
                    case 2: css_pos = "-289px 0"; mode = 0; break;
                    case 3: css_pos = "-289px 0"; mode = 0; break;
                    case 4: css_pos = "-289px 0"; mode = 0; break;

                    case 0: css_pos = "-325px 0"; mode = 1; break;

                    case 1: css_pos = "-362px 0"; mode = -6; break;

                    case 6: css_pos = "-253px 0"; mode = -2; break;
                    case 7: css_pos = "-253px 0"; mode = -2; break;
                    case 8: css_pos = "-253px 0"; mode = -2; break;
                }
                if( mode == - 2 )
                    switch( _this.gui[ 'radio_n_in_row' ].get_id() ){
                        case "four": mode = 2; break;
                        case "five": mode = 3; break;
                        case "six" : mode = 4; break;
                    }
                if( mode == - 6 )
                    switch( _this.gui[ 'radio_n_in_block' ].get_id() ){
                        case "six_in_a_block": mode = 6; break;
                        case "seven"         : mode = 7; break;
                        case "eight"         : mode = 8; break;
                    }

                _this.settings.mode = mode;
                _this.gui[ 'btn_new_game' ].obj.click();
                $( this ).css( "background-position", css_pos );
            },
            { _this : this }
        );
    };

    prototype.save_settings = function(){
        // Clone of the settings object:
        this.future_s = {};
        for( var i in this.settings )
            this.future_s[ i ] = this.settings[ i ];

        // Define the selected game mode:
        var selected_mode = false;
        var css_pos = "";
        switch( this.gui[ 'radio_game_mode' ].get_id() ){

            case "lines":       switch( this.gui[ 'radio_n_in_row' ].get_id() ){
                                    case "four": selected_mode = 2; break;
                                    case "five": selected_mode = 3; break;
                                    case "six" : selected_mode = 4; break;
                                }
                                break;

            case "rectangles":  selected_mode = 0;
                                break;

            case "rings":       selected_mode = 1;
                                break;

            case "blocks":      switch( this.gui[ 'radio_n_in_block' ].get_id() ){
                                    case "six_in_a_block": selected_mode = 6; break;
                                    case "seven"         : selected_mode = 7; break;
                                    case "eight"         : selected_mode = 8; break;
                                }
                                break;

        }
        var flag = false;
        var dialog = false;
        // Вспомагательная функция для вывода вопроса о применении нового режима игры:
        var confirm_f =
            function(){
                return confirm( 'Применить новый режим игры? "Ок" - Будет начата новая игра, "Отмена" - режим будет применен '+
                                'для следующей игры.' );
            };
        if( selected_mode != this.settings.mode ){

            if( this.field.game_started && ! dialog && confirm_f() )
                flag = true;
            if( ! this.field.game_started )
                flag = true;

            dialog = true;

            this.future_s.mode = selected_mode;

            if( selected_mode <= 1 ){
                this.future_s.field_size = 7;
                this.future_s.field_b = 1;
            }else{
                this.future_s.field_size = 9;
                this.future_s.field_b = 0;
            }

            if( ! this.field.game_started ){
                this.settings.mode = selected_mode;
                this.update_mode_button();
            }
        }

        // If necessary, show next balls positions:
        if( this.gui[ 'next' ].if_checked() != this.settings.show_next ){
            this.settings.show_next = this.gui[ 'next' ].if_checked();
            this.future_s.show_next = this.settings.show_next;
            if( this.settings.show_next )
                this.field.add_small_balls();
            else
                this.field.remove_small_balls();
        }

        // If necessary, change the balls type:
        if( this.gui[ 'radio_balls_type' ].get_id() != this.settings.balls_type ){
            this.settings.balls_type = this.gui[ 'radio_balls_type' ].get_id();
            this.future_s.balls_type = this.settings.balls_type;
            this.field.change_balls_type();
            this.info_bar.change_balls_type();
        }

        var timer_val = parseInt( this.gui[ 'timer' ].obj.parent().find( "input[type='text']").val() );
        if( ! this.gui[ 'timer' ].if_checked() ||
              this.gui[ 'zen_mode' ].if_checked() )
            timer_val = 0;

        if( timer_val != this.settings.round_time ){

            if( this.field.game_started && ! dialog && confirm_f() )
                flag = true;

            this.future_s.round_time = timer_val;

            if( ! this.field.game_started ){
                this.info_bar.time_set( timer_val );
                this.settings.round_time = timer_val;
            }
        }

        this.future_s.zen_mode = false;

        if( flag ){
            this.field.game_started = false;
            this.gui[ "btn_new_game" ].obj.click();
        }

        var str = "{";
        for( var i in this.future_s ){
            var val = this.future_s[ i ];
            var str_val = ( typeof val == "string" ) ? '"' + val + '"' : val.toString();
            str += '"' + i + '":' + str_val + ',';
        }
        str = str.substr( 0, str.length - 1 ) + "}";
        $.cookie( "settings", str, { expires : 365 } );
    };

    prototype.restore_settings = function(){
        var mode_obj = this.gui[ "radio_game_mode" ];
        var lines_sub = this.gui[ "radio_n_in_row" ];
        var block_sub = this.gui[ "radio_n_in_block" ];
        var css_pos = "";
        switch( this.settings.mode ){
            case 0: mode_obj.set_id( "rectangles" ); break;

            case 1: mode_obj.set_id( "rings" );      break;

            case 2: mode_obj.set_id( "lines" ); lines_sub.set_id( "four" ); break;
            case 3: mode_obj.set_id( "lines" ); lines_sub.set_id( "five" ); break;
            case 4: mode_obj.set_id( "lines" ); lines_sub.set_id( "six" );  break;

            case 6: mode_obj.set_id( "blocks" ); block_sub.set_id( "six_in_a_block" ); break;
            case 7: mode_obj.set_id( "blocks" ); block_sub.set_id( "seven" );          break;
            case 8: mode_obj.set_id( "blocks" ); block_sub.set_id( "eight" );          break;
        }

        this.update_mode_button();

        this.gui[ 'radio_balls_type' ].set_id( this.settings.balls_type );

        if( this.gui[ 'next' ].if_checked() != this.settings.show_next )
            this.gui[ 'next' ].obj.click();

        var timer_on = this.settings.round_time > 0 ? true : false;
        var timer_val = this.settings.round_time > 0 ? this.settings.round_time : 15;
        if( this.gui[ 'timer' ].if_checked() != timer_on )
            this.gui[ 'timer' ].obj.click();
        this.gui[ 'timer' ].obj.parent().find( "input[type='text']").val( timer_val );
    };

    prototype.restore_game = function(){
        if( $.cookie( "game" ) ){
            this.field.game_load( eval( $.cookie( "game" ) ) );
            this.update_mode_button();
            var s = this.settings.field_size;
            if( this.field.balls_count() == s * s )
                this.gui[ "btn_new_game" ].obj.click();
            else
                this.start_game( true );
        }
    };
    prototype.stop_game = function(){
        this.field.obj.stopTime( "timer" );
    };
    prototype.start_game = function( continue_game ){
        if( ! continue_game )
            $.ajax(
                {
                    type : "POST",
                     url : "server.php",
                    data : {
                                "start_game" : true
                           }
                }
            );
        var _this = this;
        this.field.obj.stopTime( "timer" ).everyTime(
            5000,
            "timer",
            function(){
                $.ajax(
                    {
                        type : "POST",
                         url : "server.php",
                        data : {
                                  "score" : _this.info_bar.score
                               }
                    }
                );
            }
        );
    };

    prototype.load_high_scores = function( my_score ){
        my_score = typeof my_score == "undefined" ? -1 : my_score;
        var page = $( "#" + this.html_inf.hsc_page_id );
        var title = page.find( "h1" );
        title.text( "Таблица рекордов. " );
        switch( this.settings.mode ){
            case 0: title.append( "Прямоугольники" ); break;
            case 1: title.append( "Ромбы" );          break;
            case 2: title.append( "Линии — 4 в ряд" ); break;
            case 3: title.append( "Линии — 5 в ряд" ); break;
            case 4: title.append( "Линии — 6 в ряд" ); break;
            case 6: title.append( "Блоки — 6" );  break;
            case 7: title.append( "Блоки — 7" ); break;
            case 8: title.append( "Блоки — 8" );  break;
        }
        var _this = this;
        var block = page.find( ".scores_block" );
        block.text( "Идет загрузка..." );
        $.ajax(
            {
                type : "POST",
                 url : "server.php",
                data : {
                            "get_high_scores" : this.settings.mode
                       },
             success :
                function( data ){
                    block.html( "" );
                    data = eval( "(" + data + ")" );
                    var tr = $( "<p></p>" ).addClass( "tr" );
                    tr.append(
                        $( "<span class='th'>Место</span>" ),
                        $( "<span class='th'>Игрок</span>" ),
                        $( "<span class='th'>Очки</span>" ),
                        $( "<span class='th'>Дата</span>" )
                    );
                    block.append( tr );
                    var place = 0;
                    for( var i in data ){
                        var tr = $( "<p></p>" ).addClass( "tr" );
                        var date = new Date();
                        date.setTime( data[ i ][ 2 ] * 1000 );
                        var day = date.getDate();
                        var month = ( date.getMonth() + 1 ) + "";
                        month = month.length == 1 ? "0" + month : month;
                        var year = date.getFullYear();
                        tr.append(
                            $( "<span class='td digital'>" + ( parseInt( i ) + 1 ) + "</span>" ),
                            $( "<span class='td'>" + data[ i ][ 0 ] + "</span>" ),
                            $( "<span class='td digital'>" + data[ i ][ 1 ] + "</span>" ),
                            $( "<span class='td'>" + day + "." + month + "." + year + "</span>" )
                        );
                        if( my_score >= data[ i ][ 1 ] && place == 0 )
                            place = parseInt( i ) + 1;
                        block.append( tr );
                    }
                    if( place ){
                        _this.stop_game();
                        if( place == 8 && my_score == data[ data.length - 1 ][ 1 ] ){
                            alert( "Игра закончена. Очки: " + my_score );
                            return;
                        }
                        var name = prompt(
                                        "Поздравляем! Ваш результат (" + my_score + ") занял " + place + " место в " +
                                        "таблице рекордов! Введите ваше имя для сохранения результата в онлайн таблице " +
                                        "рекордов (при нажатии на кнопку «Отмена» результат сохранен не будет):"
                                   );

                        if( name ){
                            $.ajax(
                                {
                                      type : "POST",
                                       url : "server.php",
                                      data : {
                                                "score" : my_score,
                                               "result" : _this.settings.mode,
                                                 "name" : name
                                             },
                                   success : function(){
                                                _this.load_high_scores();
                                                _this.open_page( _this.html_inf.hsc_page_id );
                                             },
                                     error : function(){
                                                alert( "Невозможно подключиться к серверу. Онлайн таблица рекордов недоступна." );
                                             }
                                }
                            );
                        }else
                            _this.open_page( _this.html_inf.hsc_page_id );
                    }else
                        if( my_score >= 0 ){
                            _this.stop_game();
                            alert( "Игра закончена. Очки: " + my_score );
                        }
                },
               error :
                function(){
                   block.text( "Невозможно подключиться к серверу. Онлайн таблица рекордов недоступна." );
                }
            }
        );
    };

    prototype.update_mode_button = function(){
        var css_pos = "";
        switch( this.settings.mode ){
            case 0: css_pos = "-289px 0"; break;

            case 1: css_pos = "-325px 0"; break;

            case 2: css_pos = "-253px 0"; break;
            case 3: css_pos = "-253px 0"; break;
            case 4: css_pos = "-253px 0"; break;

            case 6: css_pos = "-362px 0"; break;
            case 7: css_pos = "-362px 0"; break;
            case 8: css_pos = "-362px 0"; break;
        }
        this.gui[ 'btn_game_mode' ].obj.css( "background-position", css_pos );
    };

    prototype.zen_mode = function(){
        // Time for animation (in ms):
        var t = 200;
        var _this = this;
        if( this.busy )
            return;

        if( this.settings.zen_mode ){
            // Zen mode is off:
            this.busy = true;
            $( "#" + this.html_inf.info_bar_id ).animate( { height: this.settings.info_bar_h + "px" }, t );
            $( "#" + this.html_inf.footer_bar_id ).animate( { height: this.settings.footer_bar_h + "px" }, t,
                function(){
                    _this.busy = false;
                }
            );
            $( "#" + this.html_inf.footer_bar_id ).find( "a" ).css( "visibility", "visible" );
            this.settings.zen_mode = false;
            this.gui[ 'timer' ].enable();
        }else{
            // Zen mod is on:
            this.busy = true;
            $( "#" + this.html_inf.info_bar_id ).animate( { height: "0px" }, t );
            $( "#" + this.html_inf.footer_bar_id ).animate( { height: "0px" }, t,
                function(){
                    _this.busy = false;
                    $( "#" + _this.html_inf.footer_bar_id ).find( "a" ).css( "visibility", "hidden" );
                }
            );
            this.settings.zen_mode = true;
            this.gui[ 'timer' ].disable();
            this.settings.round_time = 0;
            this.field.timer_stop();
            this.info_bar.time_set( 0 );
        }
    };

    prototype.redraw_field = function(){
        var url = "images/";
        if( this.settings.mode <= 1 )
            url += this.html_inf.field_s_img;
        else
            url += this.html_inf.field_img;
        $( "#" + this.html_inf.field_id ).css( "background-image", "url(" + url + ")" );
    };

    prototype.open_page = function( page, callback ){
        // Save link to "this" property:
        var _this = this;
        // Time for animation (in ms):
        var t = 250;

        if( this.busy )
            return;  // I'm busy!

        if( this.active_page == page )
            page = this.html_inf.field_id;

        if( page != this.html_inf.field_id )
            this.field.timer_stop();
        else
            if( this.field.game_started )
                this.field.timer_start();

        if( ! callback )
            callback = function(){};

        this.busy = true;
        $( "#" + this.active_page ).fadeOut( t,
            function(){
                $( "#" + page ).fadeIn( t,
                    function(){
                        callback( _this );
                        _this.active_page = page;
                        _this.busy = false;
                    }
                );
            }
        );
    };

    prototype.handlers = function(){
        // Save link to "this" property:
        var _this = this;
        // Set the hot keys handlers:
        $( document ).keyup(
            function( e ){
                switch( e.keyCode ){
                    // Show or hide info bars up and below the field:
                    case 90: _this.gui[ "zen_mode" ].obj.click(); break;
                    case 27: _this.gui[ "zen_mode" ].obj.click(); break;
                }
            }
        );
        var f = function( e ){
            // w3c standard method:
            e.stopPropagation();
        };
        // Stop click events propagation:
        $( "#" + this.html_inf.field_id ).click( f );
        $( "#" + this.html_inf.hsc_page_id ).click( f );
        $( "#" + this.html_inf.opt_page_id ).click( f );
        $( "#" + this.html_inf.hlp_page_id ).click( f );
        $( "#" + this.html_inf.footer_bar_id ).click( f );
        $( "html" ).click(
            function(){
                if( _this.active_page != _this.html_inf.field_id )
                    // If the current page isn't "field", restore game settings and open it:
                    _this.gui[ "btn_cancel" ].obj.click();
            }
        );
    };

}



/* The game radio group class: */

/*
 * html_name   : name of radio group
 * [ evt ]     : event name (example: "click")
 * [ func ]    : handler function
 * [ f_param ] : data for the handler function
 **/
with(Radio_group = function( html_name, evt, func, f_param ){

    /* Constructor: */

    this.obj = $( "input[name='" + html_name + "']" );
    if( evt )
        this.bind( evt, func, f_param );
}){

    prototype.bind = function( evt, func, f_param ){
        this.obj.bind(
            evt,       // Event name (example: "click")
            f_param,   // A map of data that will be passed to the event handler.
            func       // A function to execute each time the event is triggered.
        );
    };

    prototype.get_id = function(){
        return this.obj.filter( ":checked" ).attr( "id" );  // Return id of the selected element of radio group
    };

    prototype.set_id = function( html_id ){
        this.obj.filter( "#" + html_id ).click().change();  // Set the element with id = html_id to selected
    };

    prototype.disable = function(){
        this.obj.attr( "disabled", true );  // Disable radio group
    };

    prototype.enable = function(){
        this.obj.removeAttr( "disabled" );  // Enable radio group
    };
}



/* The game button class: */

/*
 * Links html object to the event handler.
 * html_id     : id of html object
 * [ evt ]     : event name (example: "click")
 * [ func ]    : handler function
 * [ f_param ] : data for the handler function
 **/
with(Button = function( html_id, evt, func, f_param ){

    /* Constructor: */

    this.obj = $( "#" + html_id );
    if( evt )
        this.bind( evt, func, f_param );
}){

    prototype.bind = function( evt, func, f_param ){
        this.obj.bind(
            evt,       // Event name (example: "click")
            f_param,   // A map of data that will be passed to the event handler.
            func       // A function to execute each time the event is triggered.
        );
    };

    prototype.if_checked = function(){
        // Return true, if the checkbox is on:
        if( this.obj.filter( ":checked" ).length > 0 )
            return true;
        return false;
    };

    prototype.disable = function(){
        this.obj.attr( "disabled", "disabled" );  // Disable button
    };

    prototype.enable = function(){
        this.obj.removeAttr( "disabled" );  // Enable button
    };
}



/* The game info bar class: */

with(Info_bar = function( html_id, score_id, timer_id, settings ){

    /* Constructor: */

    this.obj = $( "#" + html_id );  // Saving the jQuery object of info bar
    this.obj_score = $( "#" + score_id );
    this.obj_timer = $( "#" + timer_id );

    var _this = this;               // Save link to "this" property
    $( "#" + html_id ).children( "div" ).children().svg(
        {
            onLoad: function( svg ){
                _this.svg_obj = svg;   // Saving SVG object of field
            }
        }
    );

    // Array of the Ball class objects
    this.balls = [];

    // Game score:
    this.score = 0;

    // Game settings object:
    this.settings = settings;

    this.time_set( this.settings.round_time );

}){
    /* Methods */

    /*
     * Update self & html content with new time
     */
    prototype.time_set = function( new_time ) {
        this.time = new_time;
        this.obj_timer.text( this.time );
    }

    /*
     * Set new score value
     */
    prototype.set_score = function( score ){
        this.obj_score.text( score );
    };

    /*
     * Plus score and set it to bar
     */
    prototype.plus_score = function( score ){
        this.score += score;
        this.set_score( this.score );
    };

    /*
     * Set game score to zero
     */
    prototype.score2zero = function(){
        this.score = 0;
        this.set_score( 0 );
    };

    /*
     * Remove all balls from the own SVG object:
     */
    prototype.remove_balls = function(){
        for( var i in this.balls )
            this.balls[ i ].erase();
        this.balls = [];
    };

    /*
     * Change balls type:
     */
    prototype.change_balls_type = function(){
        for( var i in this.balls )
            this.balls[ i ].change_type( this.settings.balls_type );
    };

    /*
     * Draw balls on the own SVG object:
     * arr   : array of colors of balls
     * size  : size of the field cell (in px)
     */
    prototype.put_balls = function( arr ){
        for( var i in arr ){
            var rec = arr[ i ];
            var ball = new Ball( this.svg_obj, rec[ 1 ].num, this.settings.cell_size + this.settings.border_size, this.settings.balls_type );
            ball.popup( i * 1, 0, 0.3 );
            this.balls.push( ball );
        }
    };
}



/* The game field class: */

/*
 * Create field object.
 * html_id     : id of <div> which contains svg
 **/
with(Field = function( html_id, info_bar_obj, game_obj ){

    this.obj = $( "#" + html_id );  // Saving the jQuery object of field
    var _this = this;               // Save link to "this" property
    $( "#" + html_id ).children().svg(
        {
            onLoad: function( svg ){
                _this.svg_obj = svg;   // Saving SVG object of field
            }
        }
    );

    // Link to the Info_bar class object:
    this.info_bar_obj = info_bar_obj;

    // Link to the main game object:
    this.game_obj = game_obj;
    // Settings object:
    this.settings = game_obj.settings;

    this.map = new Array( 9 );       // The 2d array of Ball class objects
    for( var i = 0; i < 9; i++ )
        this.map[ i ] = new Array( null, null, null, null, null, null, null, null, null );

    // search motion's patterns
    // each motion pattern is an array of numbers which determine
    // direction of motion:
    //
    //     7 0 1
    //      \|/
    //     6-*-2
    //      /|\
    //     5 4 3
    //
    this.figures = [
       [ [ 0, 6, 4, 2 ] ],   // square
       [ [ 1, 7, 5, 3 ] ],   // rhomb
       [ [ 2, 2, 2, 2 ], [ 0, 0, 0, 0 ], [ 1, 1, 1, 1 ], [ 3, 3, 3, 3 ] ],                          // 4-ball line
       [ [ 2, 2, 2, 2, 2 ], [ 0, 0, 0, 0, 0 ], [ 1, 1, 1, 1, 1 ], [ 3, 3, 3, 3, 3 ] ],              // 5-ball line
       [ [ 2, 2, 2, 2, 2, 2 ], [ 0, 0, 0, 0, 0, 0 ], [ 1, 1, 1, 1, 1, 1 ], [ 3, 3, 3, 3, 3, 3 ] ],  // 6-ball line
    ];

    // X and Y coords of selected ball (in cells):
    this.sel_ball = null;

    // Put 3 first balls on the field:
    this.put_balls( this.gen_next_balls() );

    // Array of "next" colors and positions of balls, which will appear at the field in the next turn:
    this.next_balls = this.gen_next_balls();
    if( this.settings.show_next )
        this.add_small_balls();

    // Update info bar balls:
    this.update_info_bar();
    // Did the game start?
    this.game_started = false;

    this.handlers();    // Set the event handlers:

}){
    ////////////////// Methods ////////////////

    /*
     * Generate 3 new colors & positions of balls and return them in array:
     */
    prototype.gen_next_balls = function() {
        var arr = [];
        var s = this.settings.field_size;
        var dl = this.settings.field_b;
        var cnt = s * s - this.balls_count();
        if( cnt > 3 ) cnt = 3;
        for( var i = 0; i < cnt; i++ ) {
            var color = this.rand( 1, 7 );
            do {
                var nx = this.rand( 0 + dl, 8 - dl );
                var ny = this.rand( 0 + dl, 8 - dl );
                var unique = true;
                for( var j in arr )
                    if( arr[ j ][ 0 ][ 0 ] == nx && arr[ j ][ 0 ][ 1 ] == ny )
                        unique = false;  // don't took empty place on the map twice
            } while( this.map[ ny ][ nx ] || ! unique );
            var ball = new Ball( this.svg_obj, color, this.settings.cell_size + this.settings.border_size, this.settings.balls_type )
            arr.push( [ [ nx, ny ], ball ] );
        }
        return arr;
    };


    /*
     * Update the Info_bar class object balls:
     */
    prototype.update_info_bar = function(){
        // Remove old "next" balls from the info bar:
        this.info_bar_obj.remove_balls();
        // Put new "next" balls on the info bar:
        this.info_bar_obj.put_balls( this.next_balls );
    };

    /*
     * starts new round: put new balls on map,
     *                   remove new possible combinations,
     *                   reset timer
     */
    prototype.next_round = function() {
        this.put_balls( this.next_balls );          // put 3 balls which was generated before
        this.remove_balls();                        // put_balls can create new true figres...
        this.game_save();                           // Save the current game
        var s = this.settings.field_size;
        if( this.balls_count() == s * s )
        {
            this.timer_stop();
            this.game_obj.load_high_scores( this.info_bar_obj.score );
            this.game_started = false;
            return;
        }
        this.next_balls = this.gen_next_balls();    // generate 3 new "next" balls
        if( this.settings.show_next )
            this.add_small_balls();
        this.update_info_bar();                     // update info bar "next" balls
        this.timer_reset();                         // reset timer
    };

    /*
     * Reset game timer
     */
    prototype.timer_reset = function(){
        this.info_bar_obj.time_set( this.settings.round_time );
        this.timer_stop();
        this.timer_start();
    };

    /*
     * Stop game timer:
     */
    prototype.timer_stop = function(){
        $( this ).stopTime( 'clock_down' );
    };

    /*
     * Start game timer and update info bar object:
     */
    prototype.timer_start = function(){
        if( this.settings.round_time == 0 )
            return;

        $( this ).everyTime(
            1000,
            'clock_down',
            function(){
                var ib = this.info_bar_obj;
                ib.time_set( ib.time - 1 );  // decrease by one second
                if( ib.time == 0 )
                    this.next_round();       // put balls and reset time
            }
        );
    };

    /*
     * Draw balls on the own SVG object:
     * arr : array of positions & balls,
     *       i.e. [ [ [x,y], ball ], [ [x,y], ball ], ... ]
     */
    prototype.put_balls = function( arr ){
        var dl = this.settings.field_b;
        for( var i in arr ){
            var rec = arr[ i ];
            var nx = rec[ 0 ][ 0 ];
            var ny = rec[ 0 ][ 1 ];
            var ball = new Ball( this.svg_obj, rec[ 1 ].num, this.settings.cell_size + this.settings.border_size, this.settings.balls_type );
            if( this.map[ ny ][ nx ] )     // user can send ball to this place
            {
                do {
                    nx = this.rand( 0 + dl, 8 - dl );
                    ny = this.rand( 0 + dl, 8 - dl );
                } while( this.map[ ny ][ nx ] );   // find new place...
            }
            ball.popup( nx, ny, 1 );       // popup at position which was stored earlier
            this.map[ ny ][ nx ] = ball;   // store real ball on the map, hint-ball will be destroyed automatically
            rec[ 1 ].erase();              // after this remove old ball's SVG object
        }
    };


    /*
     * Remove all balls from the field and generates new next_balls
     */
    prototype.clear = function(){
        for( var i in this.map )
            for( var j in this.map[ i ] )
                if( this.map[ i ][ j ] ){
                    this.map[ i ][ j ].jump_stop( true );
                    this.map[ i ][ j ].erase();
                    this.map[ i ][ j ] = null;
                }

        this.remove_small_balls();

        this.sel_ball = null;
        this.next_balls = this.gen_next_balls();
    };

    /*
     * Remove all "small balls":
     */
    prototype.remove_small_balls = function(){
        for( var i in this.next_balls )
            if( this.next_balls[ i ][ 1 ].obj )
                this.next_balls[ i ][ 1 ].erase();
    };

    /*
     * Add "small balls" to the field:
     */
    prototype.add_small_balls = function(){
        for( var i in this.next_balls ){
            var nx = this.next_balls[ i ][ 0 ][ 0 ];
            var ny = this.next_balls[ i ][ 0 ][ 1 ];
            this.next_balls[ i ][ 1 ].popup( nx, ny, 0.3 );
        }
    };

    prototype.find_path = function( f_x, f_y, to_x, to_y ) {
        var stack = Array( );           // stack for multiple purposes
        var dl = this.settings.field_b;

        var arr = new Array( 9 );       // 2d array for back-path
        for( var i = 0; i < 9; i++ )
            arr[ i ] = new Array( null, null, null, null, null, null, null, null, null );


        stack.push( [ f_x, f_y ] );

        while( stack.length )
        {
            var pos = stack.splice( 0,1 )[ 0 ];  // take first element and remove them

            var d = [ [ 1, 0 ], [ -1, 0 ], [ 0, 1 ], [ 0, -1 ] ];   // allowed motions
            for( var i in d )
            {
                var x = pos[ 0 ] + d[ i ][ 0 ];
                var y = pos[ 1 ] + d[ i ][ 1 ];
                if( ( x >= 0 + dl ) && ( y >= 0 + dl ) && ( x <= 8 - dl ) && ( y <= 8 - dl ) &&
                    ! this.map[ y ][ x ] && ! arr[ y ][ x ] )
                {
                    arr[ y ][ x ] = pos;    // we go to position ( x, y ) from position pos
                    stack.push( [ x, y ] ); // add new place...
                }
            }
        }

        if( !arr[ to_y ][ to_x ] )
            return [];

        var x = to_x;
        var y = to_y;
        while( x != f_x || y != f_y )
        {
            var pos = arr[ y ][ x ];
            stack.push( [ x, y ] );
            x = pos[ 0 ];
            y = pos[ 1 ];
        }

        return stack;
    }

    prototype.move_ball = function( to_x, to_y, callback ) {
        if( ! this.sel_ball )
            return false;

        var nx = this.sel_ball.x;
        var ny = this.sel_ball.y;
        path = this.find_path( nx, ny, to_x, to_y );

        if( path.length > 0 ){
            var old_ball = this.map[ ny ][ nx ];
            this.map[ ny ][ nx ] = null;

            // we must create new ball, because of two parallel animations:
            // hiding old ball & popupping new ball
            var new_ball = new Ball( this.svg_obj, old_ball.num, this.settings.cell_size + this.settings.border_size, this.settings.balls_type );

            this.map[ to_y ][ to_x ] = new_ball;

            old_ball.remove();
            this.sel_ball = null;

            var after_move = function( _this ){
                // Moving sucessfull:
                callback( _this );
            };

            new_ball.popup( to_x, to_y, 1, after_move, this );

            return true;
        }
        // Moving faild!
        return false;
    }

    /*
     * Try to select ball on the field
     * nx, ny : position on the field ( numbers )
     */
    prototype.select_ball = function( nx, ny ){

        if( this.map[ ny ][ nx ] ){

            // Select ball and set to it "jumping" effect:

            if( this.sel_ball ){

                if( this.sel_ball.x == nx &&
                    this.sel_ball.y == ny )
                    // don't do anything:
                    return;

                var x = this.sel_ball.x;
                var y = this.sel_ball.y;
                this.map[ y ][ x ].jump_stop();
            }
            this.sel_ball = { "x" : nx,
                              "y" : ny };
            this.map[ ny ][ nx ].jump();
            return;
        }

    };


    /*
     * Test for existance of figure on the map
     * nx, ny : coordinates to start motion from
     * ms     : motions which describe figure
     * mark   : if true mark balls on the path
     *
     * For example:
     *
     *   012345678
     * 0 .o.......
     * 1 o.o......
     * 2 .o.......
     * 3 ..o......
     * 5 .o.o.....
     * 6 ..o....o.
     * 7 ......o..
     * 8 .......o.
     *
     * test_path( 0, 0, [ 1, 7, 5, 3 ] ) --> false
     * test_path( 1, 0, [ 1, 7, 5, 3 ] ) --> false
     * test_path( 1, 2, [ 1, 7, 5, 3 ] ) --> true
     * test_path( 2, 1, [ 1, 7, 5, 3 ] ) --> false
     * test_path( 2, 6, [ 1, 7, 5, 3 ] ) --> true
     * test_path( 7, 8, [ 1, 7, 5, 3 ] ) --> false
     *
     */
    prototype.test_path = function( nx, ny, ms, mark ){
        var x = nx;
        var y = ny;
        var dl = this.settings.field_b;
        var num = this.map[ y ][ x ].num;  // save color of ball (number)

        for( var i in ms )
        {
            if( x < 0 + dl || y < 0 + dl || x > 8 - dl || y > 8 - dl )
                return false;

            if( ! this.map[ y ][ x ] || this.map[ y ][ x ].num != num )  // broken path or wrong color
                return false;

            if( mark )
                this.map[ y ][ x ].marked = true;

            var res = this.move_xy( x, y, ms[ i ] );
            x = res[ 0 ];
            y = res[ 1 ];
        }
        return true; // all OK, movies are good
    };

    /*
     * This is tool-function, which return new coordinates.
     * x,y : old coordinates
     * mov : motion direction ( number )
     */
    prototype.move_xy = function( x, y, mov ) {
        var nx = x;
        var ny = y;
        switch( mov ) {
            case 0: ny-=1;        break;
            case 1: ny-=1; nx+=1; break;
            case 2: nx+=1;        break;
            case 3: nx+=1; ny+=1; break;
            case 4: ny+=1;        break;
            case 5: ny+=1; nx-=1; break;
            case 6: nx-=1;        break;
            case 7: nx-=1; ny-=1; break;
        }
        return [ nx, ny ]; // return new coords
    }

    /*
     * This method find and removes group of balls which is
     * belong to current figure path ( box, rombs, etc. )
     */
    prototype.remove_path = function() {
        var f = this.figures[ this.settings.mode ];  // alias...

        for( var j = 0; j < this.map.length; j++ )
            for( var i = 0; i < this.map[ j ].length; i++ )
                if( this.map[ j ][ i ] )
                    for( var k in f )
                        if( this.test_path( i, j, f[ k ] ) )
                            this.test_path( i, j, f[ k ], true );  // mark balls for deletion

        function remove_group( nx, ny, _this ) {
            var stack = Array( );   // stack for siblings
            var cnt = 0;            // count of removed balls
            var dl = _this.settings.field_b;

            stack.push( [ nx, ny ] );
            while( stack.length )
            {
                var pos  = stack.splice( 0,1 )[ 0 ];         // take first element and remove them
                var ball = _this.map[ pos[ 1 ] ][ pos[ 0 ] ];

                if( !ball )  // ball may be sheduled for deletion in stack more than one time
                    continue;

                ball.remove();                               // animate & destroy SVG
                _this.map[ pos[ 1 ] ][ pos[ 0 ] ] = null;    // remove from map
                cnt++;                                       // count it...

                var use = {};
                for( var k in f )                     // try all templates
                    for( var m in f[ k ] )            // ... and each motion direction from template
                        if( !use[ f[ k ][ m ] ] )     // ... use each motion only once
                        {
                            use[ f[ k ][ m ] ] = true;
                            for( var t = 0; t <= 1; t++ ) // test forward / backward pairs
                            {
                                var mov = ( f[ k ][ m ] + t * 4 ) % 8;   // by 4 we rotate f[ k ][ m ] at 180 degree
                                var res = _this.move_xy( pos[ 0 ], pos[ 1 ], mov );

                                if( res[ 0 ] >= 0 + dl && res[ 1 ] >= 0 + dl && res[ 0 ] <= 8 - dl && res[ 1 ] <= 8 - dl )  // test boundaries
                                {
                                    var tmp = _this.map[ res[ 1 ] ][ res[ 0 ] ];
                                    if( tmp && tmp.marked )    // we found marked ball..
                                        stack.push( res );     // add its position to search from for new balls
                                }
                            }
                        }
            }
            return cnt;
        }

        var cnt = 0;  // count of removed balls
        for( var j = 0; j < this.map.length; j++ )
            for( var i = 0; i < this.map[ j ].length; i++ )
                if( this.map[ j ][ i ] && this.map[ j ][ i ].marked )
                    cnt += remove_group( i, j, this );

        var cnt_min = this.figures[ this.settings.mode ][ 0 ].length;

        return ( cnt - cnt_min + 1 ) * cnt;  // return scores for removed path
    };


    /*
     * count balls in each block and can del balls
     */
    prototype.test_block = function( nx, ny, del ) {
        var num = this.map[ ny ][ nx ].num;  // save color of ball (number)
        var stack = Array();                 // ball's siblings
        var cnt = 0;                         // count of balls in block
        var dl = this.settings.field_b;

        stack.push( [ nx, ny ] );
        this.map[ ny ][ nx ].marked = true;  // don't add this ball as sibling
        while( stack.length )
        {
            var pos = stack.splice( 0,1 )[ 0 ];  // take first element and remove them
            cnt++;                               // increase count of balls in group
            if( del )
            {
                this.map[ pos[ 1 ] ][ pos[ 0 ] ].remove();  // animate & destroy SVG
                this.map[ pos[ 1 ] ][ pos[ 0 ] ] = null;    // ... and remove from map
            }

            for( var dy = -1; dy <= 1; dy++ )
                for( var dx = -1; dx <= 1; dx++ )
                {
                    var x = pos[ 0 ] + dx;
                    var y = pos[ 1 ] + dy;
                    if( Math.abs( dx ) ^ Math.abs( dy )  &&    // logical XOR ( only one direction { up, down, left, right } is allowed )
                        x >= 0 + dl && x <= 8 - dl && y >= 0 + dl && y <= 8 - dl ) // boundary conditions
                    {
                        var tmp = this.map[ y ][ x ];
                        if( tmp && tmp.num == num && !tmp.marked )  // ... same color && not added early
                        {
                            tmp.marked = true;
                            stack.push( [ x, y ] );
                        }
                    }
                }
        }

        // after all remove all marks from balls
        for( var j = 0; j < this.map.length; j++ )
            for( var i = 0; i < this.map[ j ].length; i++ )
                if( this.map[ j ][ i ] )
                    this.map[ j ][ i ].marked = false;

        return cnt;
    };

    /*
     * same as remove_path, but group of balls will be
     * founded by another algorithm.
     */
    prototype.remove_block = function() {
        var cnt = 0;
        var cnt_min = this.settings.mode;  // minimal count of balls in block
        for( var j = 0; j < this.map.length; j++ )
            for( var i = 0; i < this.map[ j ].length; i++ )
                if( this.map[ j ][ i ] && ( this.test_block( i, j ) >= cnt_min ) )
                    cnt += this.test_block( i, j, true );

        return ( cnt - cnt_min + 1 ) * cnt;  // return scores for removed block
    };

    /*
     * this method combine abilities of remove_block / remove_path with
     * updating scores in GUI element.
     */
    prototype.remove_balls = function() {
        var score = 0;
        if( this.settings.mode > 4 )
            score += this.remove_block();
        else
            score += this.remove_path();

        this.info_bar_obj.plus_score( score );

        return score;
    };

    prototype.balls_count = function() {
        var cnt = 0;
        for( var j = 0; j < this.map.length; j++ )
            for( var i = 0; i < this.map[ j ].length; i++ )
                if( this.map[ j ][ i ] )
                    cnt++;
        return cnt;
    }

    /*
     * Save current game to the cookie with name "game":
     */
    prototype.game_save = function(){
        var str = "[" + this.info_bar_obj.score + ",[";
        for( var i in this.map ){
            str += "["
            for( var j in this.map[ i ] ){
                str += this.map[ i ][ j ] ? this.map[ i ][ j ].num : 0;
                if( parseInt( j ) != this.map[ i ].length - 1 )
                    str += ",";
            }
            str += "]";
            if( parseInt( i ) != this.map.length - 1 )
                str += ",";
        }
        str += "],[";
        for( var i in this.next_balls ){
            var arr = this.next_balls[ i ];
            str += "[[" + arr[ 0 ][ 0 ] + "," + arr[ 0 ][ 1 ] + "],";
            str += arr[ 1 ].num + "]";
            if( parseInt( i ) != this.next_balls.length - 1 )
                str += ","
        }
        str += "]," + this.settings.mode + "]";
        $.cookie( "game", str, { expires : 365 } );
    };

    /*
     * Load game from the array:
     */
    prototype.game_load = function( arr ){
        this.info_bar_obj.score = arr[ 0 ];
        this.info_bar_obj.set_score( arr[ 0 ] );
        this.clear();
        this.map = new Array( 9 );
        for( var i = 0; i < 9; i++ )
            this.map[ i ] = new Array( null, null, null, null, null, null, null, null, null );
        for( var i in arr[ 1 ] )
            for( var j in arr[ 1 ][ i ] ){
                var color = arr[ 1 ][ i ][ j ];
                if( color == 0 )
                    continue;
                var nx = parseInt( j );
                var ny = parseInt( i );
                var ball = new Ball( this.svg_obj, color, this.settings.cell_size + this.settings.border_size, this.settings.balls_type );
                ball.popup( nx, ny, 1 );
                this.map[ ny ][ nx ] = ball;
            }
        this.next_balls = new Array();
        for( var i in arr[ 2 ] ){
            var rec = arr[ 2 ][ i ];
            var nx = rec[ 0 ][ 0 ];
            var ny = rec[ 0 ][ 1 ];
            var color = rec[ 1 ];
            var ball = new Ball( this.svg_obj, color, this.settings.cell_size + this.settings.border_size, this.settings.balls_type );
            this.next_balls.push( [ [ nx, ny ], ball ] );
        }
        this.update_info_bar()
        if( this.settings.show_next )
            this.add_small_balls();
        this.settings.mode = arr[ 3 ];
        if( this.settings.mode <= 1 ){
            this.settings.field_size = 7;
            this.settings.field_b = 1;
        }else{
            this.settings.field_size = 9;
            this.settings.field_b = 0;
        }
        this.game_started = true;
        this.timer_start();
    };

    /*
     * Change balls type:
     */
    prototype.change_balls_type = function(){
        for( var i in this.map )
            for( var j in this.map[ i ] )
                if( this.map[ i ][ j ] )
                    this.map[ i ][ j ].change_type( this.settings.balls_type );

        for( var i in this.next_balls )
            if( this.next_balls[ i ][ 1 ].obj )
                this.next_balls[ i ][ 1 ].change_type( this.settings.balls_type );
    };


    prototype.handlers = function(){
        // Save link to "this" property:
        var _this = this;

        // Configure click event handler:
        this.obj.mousedown(
            function( e ){
                // Get the margin of SVG object:
                var mx = _this.obj.children().css( "margin-left" ).replace( "px", '' );
                var my = _this.obj.children().css( "margin-top" ).replace( "px", '' );

                // X and Y coords of cursor about field object:
                var x = e.pageX - _this.obj.offset().left - mx;
                var y = e.pageY - _this.obj.offset().top - my;

                // X and Y numbers of the cell which is under mouse cursor:
                var nx = Math.floor( x / ( _this.settings.cell_size + _this.settings.border_size ) );
                var ny = Math.floor( y / ( _this.settings.cell_size + _this.settings.border_size ) );
                var dl = _this.settings.field_b;

                // Check the boundary conditions:
                if( ( x - ( _this.settings.cell_size + _this.settings.border_size ) * nx > _this.settings.cell_size && nx < 8 - dl ) ||
                    ( y - ( _this.settings.cell_size + _this.settings.border_size ) * ny > _this.settings.cell_size && ny < 8 - dl ) )
                    return false;

                _this.select_ball( nx, ny );     // try to select ball on the map

                var callback = function( _this ){
                    if( ! _this.remove_balls() )   // user does not build new figure...
                        _this.next_round();        // go to the next round
                    else
                        _this.timer_reset();        // but reset timer

                    _this.game_save();
                };

                if( _this.move_ball( nx, ny, callback ) ){  // try move selected ball to new position
                    if( ! _this.game_started )
                        _this.game_obj.start_game();
                    _this.game_started = true;
                }
            }
        );
    };


    /*
     * Auxiliary method for generating random numbers in a certain range:
     */
    prototype.rand = function( m, n ){
        m = parseInt( m );
        n = parseInt( n );
        return Math.floor( Math.random() * ( n - m + 1 ) ) + m;
    };
}



with(Ball = function( svg_obj, img_number, img_size, type ){

    /* Constructor */

    this.svg_obj = svg_obj;

    // Save the ball image number:
    this.num = img_number;

    // Define the image name:
    this.img_name = undefined;
    switch( this.num ){
        case 1: this.img_name = 'red';    break;
        case 2: this.img_name = 'black'; break;
        case 3: this.img_name = 'yellow'; break;
        case 4: this.img_name = 'green';  break;
        case 5: this.img_name = 'cyan';   break;
        case 6: this.img_name = 'blue';   break;
        case 7: this.img_name = 'purple'; break;
    }

    this.prefix = '';
    if( type == "glossy" )
        this.prefix = "_glossy";

    // The ball image size (in px):
    this.size = img_size;
}){
    /* Methods */

    /*
     * This method create new SVG object and place it on the screen.
     * If SVG already exist then it will be destroyed first so you can
     * call draw multiple times to immediately place ball at new position
     * without animation.
     */
    prototype.draw = function( x, y, scale ){
        this.erase();  // first erase old SVG object

        /*
         * Create jQuery object:
         * Here some magic... Image is created with its center at ( 0, 0 ) and
         * then moved through transform matrix to exact position.
         * This is due to draw position ( first two arguments of svg_obj.image ) is not
         * stored to transform matrix. I.e. object always created with this
         * transform matrix:
         * [ sx  0   tx ]  sx = sy = 1
         * [ 0   sy  ty ]  tx = ty = 0
         * [ 0   0   1  ]
         */
        this.obj = $( this.svg_obj.image(
                           ( - this.size / 2 ),  // image center equal to coordinates origin ( 0, 0 )
                           ( - this.size / 2 ),
                           this.size - 1,
                           this.size - 1,
                           'images/' + this.img_name + this.prefix + '.png',
                           { transform:
                             /*  Transformation matrix:
                              *  | sx 0  tx |
                              *  | 0  sy ty | ~ [ sx, 0, 0, sy, tx, ty ];
                              *  | 0  0  1  |
                              *
                              *  sx, sy - scaling object
                              *  tx, ty - translating object
                              */
                             "matrix( " + scale +", 0, 0, " + scale + "," +
                                ( x * this.size + this.size / 2 ) + ',' +
                                ( y * this.size + this.size / 2 ) +
                             ")"
                           }
                      )
                   );

        this.x = x;
        this.y = y;
    };


    prototype.change_type = function( new_type ){

        if( new_type == "glossy" )
            this.prefix = "_glossy";
        else
            this.prefix = "";

        this.obj.attr( "href", 'images/' + this.img_name + this.prefix + '.png' );
    };


    /*
     * Destroy internal SVG object.
     */
    prototype.erase = function(){
        if( this.obj )
            this.obj.remove();  // remove SVG object
    }


    /*
     * Popup ball with animation at position ( nx, ny )
     */
    prototype.popup = function( nx, ny, scale, callback, clbk_param ){
        this.draw( nx, ny, 0 );                      // create new SVG object with zero size
        this.animate( [ [ nx, ny, scale, 100 ] ], callback, clbk_param );  // ... and animate to desired size
    };


    /*
     * Remove ball with animation.
     * After animation SVG object will be destroyed.
     */
    prototype.remove = function(){
        var self = this;
        callback = function() { self.erase(); }

        this.jump_stop( true ); // hard stop of jumping animation
        this.animate( [ [ this.x, this.y, 0, 100 ] ], callback );  // animate to zero scale
    };


    /*
     * Very flexible method to animate existing SVG ball object.
     * structure  : array of structures [ new_x, new_y, new_scale, time ]
     * callback   : callback to call after all animation steps.
     * clbk_param : callback function parameter
     *
     * For example:
     *
     * this.animate( [ [ 1, 1, 1, 100 ], [ 2, 2, 1.1, 200 ] ], function() { alert( 'bla' ) } );
     *
     * 1 step : animate from current position and scale to x = 1, y = 1, scale = 1 during 100 ms
     * 2 step : animate to x = 2, y = 2, scale = 1.1 during 200 ms
     * after this alert will be shown.
     */
    prototype.animate = function( structure, callback, clbk_param ){
        var _this = this;  // save link to this...

        // ... send part of structure to next animation step
        var func = function(){
            _this.animate( structure.slice( 1 ) );
        };
        if( structure.length == 1 )  // we on the last step,
            if( callback ){
                func = function(){
                    callback( clbk_param );  // ...at the end of animation call this callback
                };
            }else
                func = function(){};


        var arr = structure[ 0 ]; // take parameters for animation

        this.obj.animate(
            { svgTransform:
                "matrix(" +
                    arr[ 2 ] + ", 0, 0, " + arr[ 2 ] + "," +
                    ( arr[ 0 ] * this.size + this.size / 2 ) + ',' +
                    ( arr[ 1 ] * this.size + this.size / 2 ) +
                ")"
            }, arr[ 3 ], func );  // animate and go to next step or call callback
    };


    /*
     * Animate jumping :)
     * For stop this animation call jump_stop.
     * Inside hard usage of animate method...
     */
    prototype.jump = function( ){
        // animation parameters...
        var structure = [ [ this.x, this.y, 1.08, 80 ],
                          [ this.x, this.y, 1,    80 ],
                          [ this.x, this.y, 1.05, 50 ],
                          [ this.x, this.y, 1,    50 ] ]

        this.animate( structure ); // animate this immediately

        var _this = this;
        this.obj.everyTime( 1000,
            function(){
                _this.animate( structure );  // do animation cycle every 1100 ms
            }
        );
    };


    /*
     * Stop jumping animation.
     * hard : if true do not revert to scale = 1.0, otherwise
     *        animate to standard scale.
     */
    prototype.jump_stop = function( hard ){
        // Stop animation:
        this.obj.stopTime();
        if( ! hard )
            // Return default size:
            this.animate( [ [ this.x, this.y, 1, 1 ] ] );
    };
}



var lines;
$( document ).ready(
    function(){
        /* Game initialization after the page loads: */
        // Set default game settings:
        /*
         * cell_size      : the field's cell size (in px)
         * border_size    : the field's cell border size (in px)
         * info_bar_h     : info bar height (in px)
         * footer_bar_h   : footer bar height (in px)
         * balls_type     : type of the game balls (one of the 'matte' and 'glossy')
         * round_time     : time ( in seconds ) for round before new balls will be placed
         * zen_mode       : zen mode enabled or not (boolean)
         * show_next      : next balls showing enabled or not (boolean)
         * mode           : game mode (number from 0 to 8)
         * field_size     : game field size (in cells)
         * field_b        : border on the field - we can't put ball on it (in cells)
         *
         * info_bar_id    : id of the DOM element with the score bar
         * footer_bar_id  : id of the settings bar
         * field_id       : id of the game's field DOM element
         * field_img      : name of the big field image file
         * field_s_img    : name of the small field image file
         * opt_btn_id     : id of the options button
         * opt_page_id    : id of the options page
         * mode_name      : name of the "game mode" radio group
         * row_n_name     : name of the "at least N balls in row" radio group
         * blk_n_name     : name of the "at least N balls in block" radio group
         * balls_type     : name of the "balls type" radio group
         * zen_mode_id    : id of the "zen mode" checkbox
         * next_id        : id of the "next balls showing" checkbox
         * timer_id       : id of the "timer constraint" checkbox
         * save_btn_id    : id of the save settings button
         * cancel_btn_id  : id of the cancel settings button
         * hlp_btn_id     : id of the help button
         * hlp_page_id    : id of the help page
         **/
        var settings =
            {
                "cell_size"     : 50,
                "border_size"   : 0,
                "info_bar_h"    : 71,
                "footer_bar_h"  : 71,
                "balls_type"    : "matte",
                "round_time"    : 0,
                "zen_mode"      : false,
                "show_next"     : false,
                "mode"          : 3,
                "field_size"    : 9,
                "field_b"       : 0
            };

        // If there is a cookie "settings" - get game settings from it:
        if( $.cookie( "settings" ) )
            settings = eval( "(" + $.cookie( "settings" ) + ")" );

        var html_inf =
            {
                "info_bar_id"    : "info_bar",
                "score_id"       : "score",
                "timer_id"       : "timer",
                "footer_bar_id"  : "footer_bar",
                "field_id"       : "field",
                "field_img"      : "field.png",
                "field_s_img"    : "field_small.png",
                "opt_btn_id"     : "options",
                "opt_page_id"    : "options_page",
                "mode_name"      : "mode",
                "row_n_name"     : "in_line",
                "blk_n_name"     : "in_block",
                "balls_type"     : "ball_type",
                "zen_mode_id"    : "zen",
                "next_id"        : "next",
                "timer_btn_id"   : "time_constraint",
                "save_btn_id"    : "save_button",
                "cancel_btn_id"  : "cancel_button",
                "hlp_btn_id"     : "help",
                "hlp_page_id"    : "help_page",
                "hsc_btn_id"     : "high_score",
                "hsc_page_id"    : "scores_page",
                "restart_btn_id" : "restart",
                "mode_btn_id"    : "mode"
            };

        lines = new Lines_game( settings, html_inf );
    }
);
