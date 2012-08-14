/* The game main class: */

with(Lines_game = function( settings, html ){

    // Save default settings of the game and html objects:
    this.settings = settings;
    this.html = html;

}){

    prototype.init = function(){
        this.store = new Store;
        // Load saved settings if possible:
        if( this.store.load( "lines_settings" ) )
            this.settings = eval( "(" + this.store.load( "lines_settings" ) + ")" );
        this.update_settings_controls();
        // Set active page as game field:
        this.active_page = this.html.field_page;
        // Create field object:
        this.field = new Field( this );
        // Set event handlers:
        this.handlers();
    };


    prototype.show_page = function( page ){
        if( this.active_page.attr( "id" ) == page.attr( "id" ) )
            return;
        this.active_page.hide()
        this.active_page = page;
        page.show();
    };


    // Update the game's mode icon on the appropriate button:
    prototype.update_mode_button = function(){
        var css_pos = "0 0";
        this.html.mode_num.text( "" );
        switch( this.settings.mode ){
            case 0: css_pos = "center -322px"; break;
            case 1: css_pos = "center -368px"; break;
            case 2: css_pos = "center -276px"; break;
            case 3: css_pos = "center -276px"; break;
            case 4: css_pos = "center -276px"; break;
            case 6: css_pos = "center -414px"; break;
            case 7: css_pos = "center -414px"; break;
            case 8: css_pos = "center -414px"; break;
        }
        this.html.mode_btn.css( "background-position", css_pos );
        if( this.settings.mode > 1 ){
            var num = this.settings.mode;
            if( this.settings.mode > 4 )
                this.html.mode_num.css( "right", '4px' ).css( "left", "auto" );  // the digit must be on the right
            else{
                this.html.mode_num.css( "left", '4px' ).css( "right", "auto" );  // the digit must be on the left
                num += 2;  // four in row = mode 2
            }
            this.html.mode_num.text( num );
        }
    };


    prototype.update_settings_controls = function(){
        // Update html elements according to new settings:
        switch( this.settings.mode ){
            case 0: this.html.mode_radio.filter( "#rectangles" ).click(); break;
            case 1: this.html.mode_radio.filter( "#rings" ).click(); break;
           default:
                if( this.settings.mode > 1 ){
                    this.html.mode_radio.filter( "#lines" ).click();
                    this.html.row_num_sel.find( "[value='" + ( this.settings.mode + 2 ) + "']" ).attr( "selected", "selected" );
                }
                if( this.settings.mode > 4 ){
                    this.html.mode_radio.filter( "#blocks" ).click();
                    this.html.block_num_sel.find( "[value='" + ( this.settings.mode ) + "']" ).attr( "selected", "selected" );
                }
        }
        if( this.settings.show_next )
            this.html.show_next_btn.attr( "checked", "checked" );
        this.update_mode_button();
    };


    prototype.save_settings = function(){
        this.new_settings = {};
        // Cloning settings object:
        for( var i in this.settings )
            this.new_settings[ i ] = this.settings[ i ];

        // Define the selected game mode:
        switch( this.html.mode_radio.filter( ":checked" ).attr( "id" ) ){
            case "lines":
                switch( this.html.row_num_sel.val() ){
                    case "4": this.new_settings.mode = 2; break;
                    case "5": this.new_settings.mode = 3; break;
                    case "6": this.new_settings.mode = 4; break;
                }
            break;
            case "rectangles":
                this.new_settings.mode = 0;
            break;
            case "rings":
                this.new_settings.mode = 1;
            break;
            case "blocks":
                switch( this.html.block_num_sel.val() ){
                    case "6": this.new_settings.mode = 6; break;
                    case "7": this.new_settings.mode = 7; break;
                    case "8": this.new_settings.mode = 8; break;
                }
            break;
        }

        if( this.new_settings.mode != this.settings.mode ){
            if( this.new_settings.mode <= 1 ){
                this.new_settings.field_size = 7;
                this.new_settings.field_border = 1;
            }else{
                this.new_settings.field_size = 9;
                this.new_settings.field_border = 0;
            }
            /*
             * TODO: make confirm of these changes if the game was started
             */
            this.settings.mode = this.new_settings.mode;
            this.update_mode_button();
        }

        // Define, whether is need to show next balls on the field:
        this.new_settings.show_next = ( this.html.show_next_btn.filter( ":checked" ).length > 0 ) ? true : false;

        var str = "{";
        for( var i in this.new_settings ){
            var val = this.new_settings[ i ];
            var str_val = ( typeof val == "string" ) ? '"' + val + '"' : val.toString();
            str += '"' + i + '":' + str_val + ',';
        }
        str = str.substr( 0, str.length - 1 ) + "}";
        this.store.save( "lines_settings", str );
    };


    prototype.handlers = function(){
        var self = this;
        this.html.options_btn.click(
            function(){
                self.show_page( self.html.options_page );
            }
        );
        this.html.help_btn.click(
            function(){
                self.show_page( self.html.help_page );
            }
        );
        this.html.high_score_btn.click(
            function(){
                self.show_page( self.html.high_score_page );
            }
        );
        this.html.cancel_opt_btn.click(
            function(){
                self.show_page( self.html.field_page );
                self.update_settings_controls();
            }
        );
        this.html.save_opt_btn.click(
            function(){
                self.show_page( self.html.field_page );
                self.save_settings();
            }
        );
        this.html.container.click(
            function( event ){
                event.stopPropagation();
            }
        );
        $( document ).click(
            function(){
                self.html.cancel_opt_btn.click();
            }
        );
    };

}




/* The game field class: */

/*
 * Create field object.
 * game_obj     : object of Lines_game class
 */
with(Field = function( game_obj ){

    this.game = game_obj;  // Link to the main game object
    this.obj = this.game.html.field_page;  // Saving the jQuery object of field

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
    this.selected_ball = null;

    // Put 3 first balls on the field:
    this.put_balls( this.gen_next_balls() );

    // Array of "next" colors and positions of balls, which will appear at the field in the next turn:
    //this.next_balls = this.gen_next_balls();
    //if( this.game.settings.show_next )
        //this.add_small_balls();

    // Update info bar balls:
    // this.update_info_bar();
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
        var s = this.game.settings.field_size;
        var dl = this.game.settings.field_border;
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
                        unique = false;  // don't take empty place on the map twice
            } while( this.map[ ny ][ nx ] || ! unique );
            var ball = new Ball( this.game.html.field_insert, color, this.game.settings.balls_type )
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
     *                   remove new possible combinations
     */
    prototype.next_round = function() {
        this.put_balls( this.next_balls );          // put 3 balls which was generated before
        /*this.remove_balls();                        // put_balls can create new true figres...
        this.game_save();                         // Save the current game
        var s = this.game.settings.field_size;
        if( this.balls_count() == s * s )
        {
            this.game_obj.load_high_scores( this.info_bar_obj.score );
            this.game_started = false;
            return;
        }
        this.next_balls = this.gen_next_balls();    // generate 3 new "next" balls
        if( this.game.settings.show_next )
            this.add_small_balls();
        this.update_info_bar();*/                     // update info bar "next" balls
    };

    /*
     * Draw balls on the own SVG object:
     * arr : array of positions & balls,
     *       i.e. [ [ [x,y], ball ], [ [x,y], ball ], ... ]
     */
    prototype.put_balls = function( arr ){
        var dl = this.game.settings.field_border;
        for( var i in arr ){
            var rec = arr[ i ];
            var nx = rec[ 0 ][ 0 ];
            var ny = rec[ 0 ][ 1 ];
            var ball = new Ball( this.game.html.field_insert, rec[ 1 ].num, this.game.settings.balls_type );
            if( this.map[ ny ][ nx ] )     // user can send ball to this place
            {
                do {
                    nx = this.rand( 0 + dl, 8 - dl );
                    ny = this.rand( 0 + dl, 8 - dl );
                } while( this.map[ ny ][ nx ] );   // find new place...
            }
            ball.popup( nx, ny, 1 );       // popup at position which was stored earlier
            this.map[ ny ][ nx ] = ball;   // store real ball on the map, hint-ball will be destroyed automatically
            rec[ 1 ].erase();              // after this remove old ball's html object
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

        this.selected_ball = null;
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
        var dl = this.game.settings.field_border;

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
        if( ! this.selected_ball )
            return false;

        var nx = this.selected_ball.x;
        var ny = this.selected_ball.y;
        path = this.find_path( nx, ny, to_x, to_y );

        if( path.length > 0 ){
            var old_ball = this.map[ ny ][ nx ];
            this.map[ ny ][ nx ] = null;

            // we must create new ball, because of two parallel animations:
            // hiding old ball & popupping new ball
            var new_ball = new Ball( this.game.html.field_insert, old_ball.num, this.game.settings.balls_type );

            this.map[ to_y ][ to_x ] = new_ball;

            old_ball.remove();
            this.selected_ball = null;

            var after_move = function( self ){
                // Moving sucessfull:
                callback( self );
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

            if( this.selected_ball ){

                if( this.selected_ball.x == nx &&
                    this.selected_ball.y == ny )
                    // don't do anything:
                    return;

                var x = this.selected_ball.x;
                var y = this.selected_ball.y;
                this.map[ y ][ x ].jump_stop();
            }
            this.selected_ball = { "x" : nx,
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
        var dl = this.game.settings.field_border;
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
        var f = this.figures[ this.game.settings.mode ];  // alias...

        for( var j = 0; j < this.map.length; j++ )
            for( var i = 0; i < this.map[ j ].length; i++ )
                if( this.map[ j ][ i ] )
                    for( var k in f )
                        if( this.test_path( i, j, f[ k ] ) )
                            this.test_path( i, j, f[ k ], true );  // mark balls for deletion

        function remove_group( nx, ny, self ) {
            var stack = Array( );   // stack for siblings
            var cnt = 0;            // count of removed balls
            var dl = self.game.settings.field_border;

            stack.push( [ nx, ny ] );
            while( stack.length )
            {
                var pos  = stack.splice( 0,1 )[ 0 ];         // take first element and remove them
                var ball = self.map[ pos[ 1 ] ][ pos[ 0 ] ];

                if( !ball )  // ball may be sheduled for deletion in stack more than one time
                    continue;

                ball.remove();                               // animate & destroy SVG
                self.map[ pos[ 1 ] ][ pos[ 0 ] ] = null;    // remove from map
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
                                var res = self.move_xy( pos[ 0 ], pos[ 1 ], mov );

                                if( res[ 0 ] >= 0 + dl && res[ 1 ] >= 0 + dl && res[ 0 ] <= 8 - dl && res[ 1 ] <= 8 - dl )  // test boundaries
                                {
                                    var tmp = self.map[ res[ 1 ] ][ res[ 0 ] ];
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

        var cnt_min = this.figures[ this.game.settings.mode ][ 0 ].length;

        return ( cnt - cnt_min + 1 ) * cnt;  // return scores for removed path
    };


    /*
     * count balls in each block and can del balls
     */
    prototype.test_block = function( nx, ny, del ) {
        var num = this.map[ ny ][ nx ].num;  // save color of ball (number)
        var stack = Array();                 // ball's siblings
        var cnt = 0;                         // count of balls in block
        var dl = this.game.settings.field_border;

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
        var cnt_min = this.game.settings.mode;  // minimal count of balls in block
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
        if( this.game.settings.mode > 4 )
            score += this.remove_block();
        else
            score += this.remove_path();

        //this.info_bar_obj.plus_score( score );

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
        str += "]," + this.game.settings.mode + "]";
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
                var ball = new Ball( this.svg_obj, color, this.game.html.cell_size, this.game.settings.balls_type );
                ball.popup( nx, ny, 1 );
                this.map[ ny ][ nx ] = ball;
            }
        this.next_balls = new Array();
        for( var i in arr[ 2 ] ){
            var rec = arr[ 2 ][ i ];
            var nx = rec[ 0 ][ 0 ];
            var ny = rec[ 0 ][ 1 ];
            var color = rec[ 1 ];
            var ball = new Ball( this.svg_obj, color, this.game.html.cell_size, this.game.settings.balls_type );
            this.next_balls.push( [ [ nx, ny ], ball ] );
        }
        this.update_info_bar()
        if( this.game.settings.show_next )
            this.add_small_balls();
        this.game.settings.mode = arr[ 3 ];
        if( this.game.settings.mode <= 1 ){
            this.game.settings.field_size = 7;
            this.game.settings.field_border = 1;
        }else{
            this.game.settings.field_size = 9;
            this.game.settings.field_border = 0;
        }
        this.game_started = true;
    };

    /*
     * Change balls type:
     */
    prototype.change_balls_type = function(){
        for( var i in this.map )
            for( var j in this.map[ i ] )
                if( this.map[ i ][ j ] )
                    this.map[ i ][ j ].change_type( this.game.settings.balls_type );

        for( var i in this.next_balls )
            if( this.next_balls[ i ][ 1 ].obj )
                this.next_balls[ i ][ 1 ].change_type( this.game.settings.balls_type );
    };


    prototype.handlers = function(){
        // Save link to "this" property:
        var self = this;

        // Configure click event handler:
        this.obj.mousedown(
            function( e ){
                // Get the padding of field html object:
                var px = self.obj.css( "padding-left" ).replace( "px", '' );
                var py = self.obj.css( "padding-top" ).replace( "px", '' );
                // X and Y coords of cursor about field object:
                var x = e.pageX - self.obj.offset().left - px;
                var y = e.pageY - self.obj.offset().top - py;

                // X and Y numbers of the cell which is under mouse cursor:
                var nx = Math.floor( x / ( self.game.html.cell_size ) );
                var ny = Math.floor( y / ( self.game.html.cell_size ) );
                var dl = self.game.settings.field_border;

                // Check the boundary conditions:
                if( ( x - ( self.game.settings.html ) * nx > self.game.settings.html && nx < 8 - dl ) ||
                    ( y - ( self.game.settings.html ) * ny > self.game.settings.html && ny < 8 - dl ) )
                    return false;

                self.select_ball( nx, ny );     // try to select ball on the map

                var callback = function( self ){
                    if( ! self.remove_balls() )   // user does not build new figure...
                        self.next_round();        // go to the next round

                    //self.game_save();
                };

                if( self.move_ball( nx, ny, callback ) ){  // try move selected ball to new position
                    //if( ! self.game_started )
                        //self.game_obj.start_game();
                    self.game_started = true;
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




with(Ball = function( parent_obj, number, type ){

    // Saving the link to parent html object:
    this.parent = parent_obj;

    // Save the ball image number:
    this.num = number;

    // Save the ball type (matte or glossy):
    this.type = type;

}){

    /*
     * Draw the ball without animation.
     */
    prototype.draw = function( x, y, scale ){
        this.erase();  // first erase old object

        // Define the css class:
        var css_class = undefined;
        switch( this.num ){
            case 1: css_class = 'red';    break;
            case 2: css_class = 'white';  break;
            case 3: css_class = 'yellow'; break;
            case 4: css_class = 'green';  break;
            case 5: css_class = 'cyan';   break;
            case 6: css_class = 'blue';   break;
            case 7: css_class = 'purple'; break;
        }
        this.obj = $( "<figure></figure>" ).addClass( css_class ).addClass( this.type );
        this.obj.css( "left", x + "em" );
        this.obj.css( "top", y + "em" );
        var arr = [ '', '-ms-', '-webkit-', '-o-', '-moz-' ];
        for( var i in arr )
            this.obj.css( arr[ i ] + "transform", 'scale(' + scale + ',' + scale + ')' );
        this.parent.append( this.obj );
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
     * Destroy internal html object.
     */
    prototype.erase = function(){
        if( this.obj )
            this.obj.remove();  // remove html object
    }


    /*
     * Popup ball with animation at position ( nx, ny )
     */
    prototype.popup = function( nx, ny, scale, callback, clbk_param ){
        this.draw( nx, ny, 0 );                      // create new object with zero size
        this.animate( [ [ nx, ny, scale, 100 ] ], callback, clbk_param );  // ... and animate to desired size
    };


    /*
     * Remove ball with animation.
     * After animation html object will be destroyed.
     */
    prototype.remove = function(){
        var self = this;
        callback = function() { self.erase(); }

        this.jump_stop( true ); // hard stop of jumping animation
        this.animate( [ [ this.x, this.y, 0, 100 ] ], callback );  // animate to zero scale
    };


    /*
     * Very flexible method to animate existing html ball object.
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
        var self = this;  // save link to this...

        // ... send part of structure to next animation step
        var func = function(){
            self.animate( structure.slice( 1 ) );
        };
        if( structure.length == 1 )  // we on the last step,
            if( callback ){
                func = function(){
                    callback( clbk_param );  // ...at the end of animation call this callback
                };
            }else
                func = function(){};


        var arr = structure[ 0 ]; // take parameters for animation

        this.obj.css( "left", arr[ 0 ] + "em" );
        this.obj.css( "top", arr[ 1 ] + "em" );

        this.obj.transition( { scale : arr[ 2 ] }, arr[ 3 ], func );
    };


    /*
     * Animate jumping :)
     * For stop this animation call jump_stop.
     * Inside hard usage of animate method...
     */
    prototype.jump = function( ){
        // animation parameters...
        var structure = [ [ this.x, this.y, 1.20, 100 ],
                          [ this.x, this.y, 1,    100 ],
                          [ this.x, this.y, 1.09, 60  ],
                          [ this.x, this.y, 1,    60  ] ]

        this.animate( structure ); // animate this immediately

        var self = this;
        this.timer = window.setInterval(
            function(){
                self.animate( structure );  // do animation cycle every 1100 ms
            },
            1000
        );
    };


    /*
     * Stop jumping animation.
     * hard : if true do not revert to scale = 1.0, otherwise
     *        animate to standard scale.
     */
    prototype.jump_stop = function( hard ){
        // Stop animation:
        if( this.timer )
            clearInterval( this.timer );
        if( ! hard )
            // Return default size:
            this.animate( [ [ this.x, this.y, 1, 1 ] ] );
    };
}



/*
 * Class for storing data into html5 store (if available) or cookies (otherwise):
 */
with(Store=function(){

    this.html5 = this.check_html5_support();

}){
    prototype.check_html5_support = function(){
        try{
            return 'localStorage' in window && window[ 'localStorage' ] !== null;
        }catch( error ){
            return false;
        }
    };


    prototype.load = function( item ){
        if( this.html5 )
            return localStorage.getItem( item );
        else{
            var arr = document.cookie.split( ";" );
            for( var i = 0; i < arr.length; i++ ){
                var x = arr[ i ].substr( 0, arr[ i ].indexOf( "=" ) );
                var y = arr[ i ].substr( arr[ i ].indexOf( "=" ) + 1 );
                x = x.replace( /^\s+|\s+$/g, "" );
                if( x == item )
                    return unescape( y );
            }
        }
        return null;
    };


    prototype.save = function( item, value ){
        if( this.html5 )
            localStorage.setItem( item, value );
        else{
            var exdate = new Date;
            exdate.setDate( exdate.getDate() + 365 );  // Expire to 1 year
            document.cookie = item + "=" + escape( value ) + "; expires=" + exdate.toUTCString();
        }
    };
}


$( document ).ready(
    function(){
        /* Game initialization after the page loads: */
        // Set default game settings:
        /*
         * balls_type     : type of the game balls (one of the 'matte' and 'glossy')
         * show_next      : next balls showing enabled or not (boolean)
         * mode           : game mode (number from 0 to 8)
         * field_size     : game field size (in cells)
         * field_border   : the inner boundary of the field (in cells) - we can't put a ball on it
         */
        var settings =
            {
                 "balls_type" : "matte",
                       "lang" : "ru",
                  "show_next" : false,
                       "mode" : 3,
                 "field_size" : 9,
               "field_border" : 0
            };

        // html objects and their attributes:
        var html =
            {
                  "cell_size" : 50,  // the field's cell size (in px)
                   "info_bar" : $( "header" ),
                      "score" : $( "#score" ),
                  "container" : $( "#container" ),
                 "field_page" : $( "#field" ),
               "field_insert" : $( "#field-insert" ),
                  "field_img" : "field.png",
                "field_s_img" : "field-small.png",
                "options_btn" : $( "#options" ),
               "options_page" : $( "#options-page" ),
                 "mode_radio" : $( 'input[name="mode"]' ),
                "row_num_sel" : $( 'select[name="line-num"]' ),
              "block_num_sel" : $( 'select[name="block-num"]' ),
             "balls_type_sel" : $( 'select[name="balls-skin"]' ),
              "show_next_btn" : $( '#next' ),
               "save_opt_btn" : $( '#ok' ),
             "cancel_opt_btn" : $( '#cancel' ),
                   "help_btn" : $( "#help" ),
                  "help_page" : $( "#help-page" ),
             "high_score_btn" : $( "#scores" ),
            "high_score_page" : $( "#scores-page" ),
               "new_game_btn" : $( "#restart" ),
                   "mode_btn" : $( "#mode" ),
                   "mode_num" : $( "#num-balls" )
            };

        var lines = new Lines_game( settings, html );
        lines.init();
    }
);