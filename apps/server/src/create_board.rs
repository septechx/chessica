use chessica_protocol::types::*;

pub fn create_initial_board() -> Vec<Option<Piece>> {
    let mut board = vec![None; 64];

    let set_piece = |board: &mut Vec<Option<Piece>>, rank: u8, file: u8, piece: Piece| {
        let index = (rank * 8 + file) as usize;
        board[index] = Some(piece);
    };

    set_piece(
        &mut board,
        6,
        0,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        6,
        1,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        6,
        2,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        6,
        3,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        6,
        4,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        6,
        5,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        6,
        6,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        6,
        7,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );

    set_piece(
        &mut board,
        7,
        0,
        Piece {
            color: Color::White,
            piece: PieceType::Rook,
        },
    );
    set_piece(
        &mut board,
        7,
        1,
        Piece {
            color: Color::White,
            piece: PieceType::Knight,
        },
    );
    set_piece(
        &mut board,
        7,
        2,
        Piece {
            color: Color::White,
            piece: PieceType::Bishop,
        },
    );
    set_piece(
        &mut board,
        7,
        3,
        Piece {
            color: Color::White,
            piece: PieceType::Queen,
        },
    );
    set_piece(
        &mut board,
        7,
        4,
        Piece {
            color: Color::White,
            piece: PieceType::King,
        },
    );
    set_piece(
        &mut board,
        7,
        5,
        Piece {
            color: Color::White,
            piece: PieceType::Bishop,
        },
    );
    set_piece(
        &mut board,
        7,
        6,
        Piece {
            color: Color::White,
            piece: PieceType::Knight,
        },
    );
    set_piece(
        &mut board,
        7,
        7,
        Piece {
            color: Color::White,
            piece: PieceType::Rook,
        },
    );
    set_piece(
        &mut board,
        1,
        0,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        1,
        1,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        1,
        2,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        1,
        3,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        1,
        4,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        1,
        5,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        1,
        6,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        1,
        7,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        0,
        0,
        Piece {
            color: Color::Black,
            piece: PieceType::Rook,
        },
    );
    set_piece(
        &mut board,
        0,
        1,
        Piece {
            color: Color::Black,
            piece: PieceType::Knight,
        },
    );
    set_piece(
        &mut board,
        0,
        2,
        Piece {
            color: Color::Black,
            piece: PieceType::Bishop,
        },
    );
    set_piece(
        &mut board,
        0,
        3,
        Piece {
            color: Color::Black,
            piece: PieceType::Queen,
        },
    );
    set_piece(
        &mut board,
        0,
        4,
        Piece {
            color: Color::Black,
            piece: PieceType::King,
        },
    );
    set_piece(
        &mut board,
        0,
        5,
        Piece {
            color: Color::Black,
            piece: PieceType::Bishop,
        },
    );
    set_piece(
        &mut board,
        0,
        6,
        Piece {
            color: Color::Black,
            piece: PieceType::Knight,
        },
    );
    set_piece(
        &mut board,
        0,
        7,
        Piece {
            color: Color::Black,
            piece: PieceType::Rook,
        },
    );

    board
}
