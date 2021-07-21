// W, A, S, D for movement

loop
	stw r1, canvas_clear

draw
	ldw r1, x
	stw r1, canvas_setX
	ldw r1, y
	stw r1, canvas_setY
	stw r1, canvas_drawPixel

logic
	ldw r1, console_readc
	bez r1, logic
	ldw r3, x
	ldw r4, y
	
if_move_right
	and r2, r1, r1
	sub r2, 100
	bnz r2, else_if_move_left
	add r3, 1
	stw r3, x
	bnz r7, else_move_end
else_if_move_left
	and r2, r1, r1
	sub r2, 97
	bnz r2, else_if_move_down
	sub r3, 1
	stw r3, x
	bnz r7, else_move_end
else_if_move_down
	and r2, r1, r1
	sub r2, 115
	bnz r2, else_if_move_up
	add r4, 1
	stw r4, y
	bnz r7, else_move_end
else_if_move_up
	and r2, r1, r1
	sub r2, 119
	bnz r2, else_move_end
	sub r4, 1
	stw r4, y
else_move_end
	bnz r7, loop

x	0
y	0