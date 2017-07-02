$(function() {
    var canvas = $('#playground')[0],
        context = canvas.getContext('2d'),
        timer = 0,
        frame_delay_msecs = 100,
        W = context.canvas.width,
        H = context.canvas.height,
        R = 10, // Person radius
        V = 0.2;

    // Return true if i, j, k are all different, false otherwise
    var different = function(i, j, k) {
        return i !== j && j !== k && k !== i;
    }

    // Clamp a point to be within the canvas
    var clamp = function(pt) {
        pt.clamp(R, R, W - R, H - R);
        return pt;
    }

    // How far from a solution?
    var error = function() {
        return this.state.reduce(function(err, p, i, state) {
            var to_left  = state[p.left].pt.clone().sub(p.pt).mod();
            var to_right = state[p.right].pt.clone().sub(p.pt).mod();
            return err + Math.abs(to_left - to_right);
        }, 0);
    }

    // Setup function: populate the room with n people, each of whom
    // follows two others.
    var setup = function() {
        var n = people();
        this.state = new Array(n);
        for (var i = 0; i < n; i++) {
            pt = new Vec(Math.random() * W, Math.random() * H);
            for (l = 0, r = 0; !different(i, l, r); ) {
                l = Math.floor(Math.random() * n);
                r = Math.floor(Math.random() * n);
            }
            this.state[i] = { pt: clamp(pt), left: l, right: r };
        }
        set_error();
    }

    var set_error = function() {
        $("#error").val(error().toFixed(2));
    }

    var clear_error = function() {
        $("#error").val(0);
    }

    // Pause activity
    var pause = function() {
        if (timer) {
            clearInterval(timer);
            timer = 0;
        }
        $('#toggle').attr('title', 'Play').click(play).html('<img src="./images/glyphicons_173_play.png" />');
    }

    // Auto-play activity
    var play = function() {
        if (!timer) {
            timer = setInterval(step, frame_delay_msecs);
        }
        $('#toggle').attr('title', 'Pause').click(pause).html('<img src="./images/glyphicons_174_pause.png" />');
    }

    // Return the step p should take to be equidistant from x and y,
    // maintaining its distance from the midpoint of x, y.
    var step_one = function(p, x, y) {
        if (x.equal(y)) {
            return Vec(0, 0);
        } else {
            var n = y.clone().sub(x).perp().unit(),
                m = x.clone().add(y).scale(0.5),
                mp = p.clone().sub(m),
                r = mp.mod(),
                sign = mp.dot(n) > 0 ? 1 : -1;
            return m.add(n.scale(r * sign)).sub(p);
        }
    }

    // Advance activity by a single step
    var step = function() {
        var new_state = this.state.map(function(p, i, state) {
            var pt = p.pt,
                l = state[p.left].pt,
                r = state[p.right].pt,
                s = step_one(pt, l, r);

            s.scale(V); // Don't step the whole way
            
            return {
                pt: clamp(pt.clone().add(s)),
                left: p.left,
                right: p.right
            };
        });
        this.state = new_state;
        redraw();
    }

    // Draw an arrow connecting p and q
    var arrow = function(p, q) {
        c = context;
        c.beginPath();
        c.moveTo(p.x, p.y);

        var pq = q.clone().sub(p);
        var mod_pq = pq.mod();
        if (mod_pq < R) {
            // no room for an arrow head!
            c.lineTo(q.x, q.y);
        } else {
            var d = mod_pq - R;
            var qq = p.clone().add(pq.unit().scale(d));
            var barb = 10;
            var angle = Math.atan2(q.y - p.y, q.x - p.x);
            c.lineTo(qq.x, qq.y);
            c.lineTo(qq.x - barb * Math.cos(angle - Math.PI/6),
                     qq.y - barb * Math.sin(angle - Math.PI/6));
            c.moveTo(qq.x, qq.y);
            c.lineTo(qq.x - barb * Math.cos(angle + Math.PI/6),
                     qq.y - barb * Math.sin(angle + Math.PI/6));
        }
        c.stroke();
    }

    // Draw the current state
    var draw = function() {
        c = context;
        this.state.forEach(function(p, i, state) {
            var lt = state[p.left], rt = state[p.right];
            c.beginPath();
            c.arc(p.pt.x, p.pt.y, R, 0, 2*Math.PI);
            c.fill();
            arrow(p.pt, lt.pt);
            arrow(p.pt, rt.pt);
        });
        set_error();
    }

    // Clear the canvas
    var clear = function() {
        pause();
        clear_error();
        context.clearRect(0, 0, W, H);
    }

    var redraw = function() {
        context.clearRect(0, 0, W, H);
        draw();
    }

    // Single step the game of followme
    var single_step = function() {
        pause();
        step();
    }

    var populate = function() {
        var canvas = $(this),
        pattern = patterns[canvas.attr('id')],
        type = canvas.data('type'),
        context = this.getContext('2d');
        context.fillStyle = pattern_colours[type];
        draw_pattern(context, pattern);
    }

    // Fill the followme canvas with a random pattern
    var random = function() {
        clear();
        setup();
        draw();
    }

    $("#slider").slider({
        value: 10,
        min: 3,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            $("#people").val(ui.value);
            clear();
            setup();
            draw();
        }
    });

    $("#people").val($("#slider").slider("value"));

    var people = function() {
        return $("#people").val();
    }

    // Add some help text to the canvas
    var add_help = function() {
        clear();
        pause();
        context.font = "18px sans-serif";
        context.fillStyle = '#666';
        context.fillText("Roll the dice to put people in random positions", 25, 50);
        context.fillText("Use the slider to set the number of people", 25, 70);
        context.fillText("Play, pause, step and watch the situation evolve", 25, 90);
        context.fillStyle = '#000';
    }

    // Activate buttons
    $('#clear').click(clear);
    $('#random').click(random);
    $('#step').click(single_step);
    $('#info').click(add_help);
    add_help();
    setup();
    draw();
});
