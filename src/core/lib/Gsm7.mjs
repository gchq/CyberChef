/**
 * GSM-7 functions.
 *
 * @author edouard hinard []
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

/**
 * Encoding tables from 3GPP document:
 *  Technical Specification
 *  3rd Generation Partnership Project;
 *  Technical Specification Group Core Network and Terminals;
 *  Alphabets and language-specific information
 *  (Release 16)
 *  3GPP TS 23.038 V16.0.0 (2020-07)
 */
let charsets = {
    // 6.2.1 GSM 7 bit Default Alphabet
    Default: `
        @  Δ SP  0  ¡  P  ¿  p
        £  _  !  1  A  Q  a  q
        $  Φ  "  2  B  R  b  r
        ¥  Γ  #  3  C  S  c  s
        è  Λ  ¤  4  D  T  d  t
        é  Ω  %  5  E  U  e  u
        ù  Π  &  6  F  V  f  v
        ì  Ψ  '  7  G  W  g  w
        ò  Σ  (  8  H  X  h  x
        Ç  Θ  )  9  I  Y  i  y
        LF Ξ  *  :  J  Z  j  z
        Ø  1) +  ;  K  Ä  k  ä
        ø  Æ  ,  <  L  Ö  l  ö
        CR æ  -  =  M  Ñ  m  ñ
        Å  ß  .  >  N  Ü  n  ü
        å  É  /  ?  O  §  o  à
    `,

    // A.3.1 Turkish National Language Locking Shift Table
    Turkish: `
        @  Δ SP  0  İ  P  ç  p
        £  _  !  1  A  Q  a  q
        $  Φ  "  2  B  R  b  r
        ¥  Γ  #  3  C  S  c  s
        €  Λ  ¤  4  D  T  d  t
        é  Ω  %  5  E  U  e  u
        ù  Π  &  6  F  V  f  v
        ı  Ψ  '  7  G  W  g  w
        ò  Σ  (  8  H  X  h  x
        Ç  Θ  )  9  I  Y  i  y
        LF Ξ  *  :  J  Z  j  z
        Ğ 1)  +  ;  K  Ä  k  ä
        ğ  Ş  ,  <  L  Ö  l  ö
        CR ş  -  =  M  Ñ  m  ñ
        Å  ß  .  >  N  Ü  n  ü
        å  É  /  ?  O  §  o  à
    `,

    // A.3.3 Portuguese National Language Locking Shift Table
    Portuguese: `
        @  Δ SP  0  Í  P  ~  p
        £  _  !  1  A  Q  a  q
        $  ª  "  2  B  R  b  r
        ¥  Ç  #  3  C  S  c  s
        ê  À  º  4  D  T  d  t
        é  ∞  %  5  E  U  e  u
        ú  ^  &  6  F  V  f  v
        í \\  '  7  G  W  g  w
        ó  €  (  8  H  X  h  x
        ç  Ó  )  9  I  Y  i  y
        LF |  *  :  J  Z  j  z
        Ô 1)  +  ;  K  Ã  k  ã
        ô  Â  ,  <  L  Õ  l  õ
       CR  â  -  =  M  Ú  m \`
        Á  Ê  .  >  N  Ü  n  ü
        á  É  /  ?  O  §  o  à
    `,

    // A.3.4 Bengali National Language Locking Shift Table
    Bengali: `
        0981 0990   SP    0 09AC 09BE 09CE    p   
        0982 0000    !    1 09AD 09BF    a    q
        0983 0000 099F    2 09AE 09C0    b    r
        0985 0993 09A0    3 09AF 09C1    c    s
        0986 0994 09A1    4 09B0 09C2    d    t
        0987 0995 09A2    5 0000 09C3    e    u
        0988 0996 09A3    6 09B2 09C4    f    v
        0989 0997 09A4    7 0000 0000    g    w
        098A 0998    )    8 0000 0000    h    x
        098B 0999    (    9 0000 09C7    i    y
          LF 099A 09A5    : 09B6 09C8    j    z
        098C   1) 09A6    ; 09B7 0000    k 09D7
        0000 099B    , 0000 09B8 0000    l 09DC
          CR 099C 09A7 09AA 09B9 09CB    m 09DD
        0000 099D    . 09AB 09BC 09CC    n 09F0
        098F 099E 09A8    ? 09BD 09CD    o 09F1
    `,

    // A.3.5 Gujarati National Language Locking Shift Table
    Gujarati: `
        0A81 0A90   SP    0 0AAC 0ABE 0AD0    p
        0A82 0A91    !    1 0AAD 0ABF    a    q
        0A83 0000 0A9F    2 0AAE 0AC0    b    r
        0A85 0A93 0AA0    3 0AAF 0AC1    c    s
        0A86 0A94 0AA1    4 0AB0 0AC2    d    t
        0A87 0A95 0AA2    5 0000 0AC3    e    u
        0A88 0A96 0AA3    6 0AB2 0AC4    f    v
        0A89 0A97 0AA4    7 0AB3 0AC5    g    w
        0A8A 0A98    )    8 0000 0000    h    x
        0A8B 0A99    (    9 0AB5 0AC7    i    y
          LF 0A9A 0AA5    : 0AB6 0AC8    j    z
        0A8C   1) 0AA6    ; 0AB7 0AC9    k 0AE0
        0A8D 0A9B    , 0000 0AB8 0000    l 0AE1
          CR 0A9C 0AA7 0AAA 0AB9 0ACB    m 0AE2
        0000 0A9D    . 0AAB 0ABC 0ACC    n 0AE3
        0A8F 0A9E 0AA8    ? 0ABD 0ACD    o 0AF1
    `,

    // A.3.6 Hindi National Language Locking Shift Table
    Hindi: `
        0901 0910   SP    0 092C 093E 0950    p
        0902 0911    !    1 092D 093F    a    q
        0903 0912 091F    2 092E 0940    b    r
        0905 0913 0920    3 092F 0941    c    s
        0906 0914 0921    4 0930 0942    d    t
        0907 0915 0922    5 0931 0943    e    u
        0908 0916 0923    6 0932 0944    f    v
        0909 0917 0924    7 0933 0945    g    w
        090A 0918    )    8 0934 0946    h    x
        090B 0919    (    9 0935 0947    i    y
          LF 091A 0925    : 0936 0948    j    z
        090C   1) 0926    ; 0937 0949    k 0972
        090D 091B    , 0929 0938 094A    l 097B
          CR 091C 0927 092A 0939 094B    m 097C
        090E 091D    . 092B 093C 094C    n 097E
        090F 091E 0928    ? 093D 094D    o 097F
    `,

    // A.3.7 Kannada National Language Locking Shift Table
    Kannada: `
        0000 0C90   SP    0 0CAC 0CBE 0CD5    p
        0C82 0000    !    1 0CAD 0CBF    a    q
        0C83 0C92 0C9F    2 0CAE 0CC0    b    r
        0C85 0C93 0CA0    3 0CAF 0CC1    c    s
        0C86 0C94 0CAA    4 0CB0 0CC2    d    t
        0C87 0C95 0CA2    5 0CB1 0CC3    e    u
        0C88 0C96 0CA3    6 0CB2 0CC4    f    v
        0C89 0C97 0CA4    7 0CB3 0000    g    w
        0C8A 0C98    )    8 0000 0CC6    h    x
        0C8B 0C99    (    9 0CB5 0CC7    i    y
          LF 0C9A 0CA5    : 0CB6 0CC8    j    z
        0C8C   1) 0CA6    ; 0CB7 0000    k 0CD6
        0000 0C9B    , 0000 0CB8 0CCA    l 0CE0
          CR 0C9C 0CA7 0CAA 0CB9 0CCB    m 0CE1
        0C8E 0C9D    . 0CAB 0CBC 0CCC    n 0CE2
        0C8F 0C9E 0CA8    ? 0CBD 0CCD    o 0CE3
    `,

    // A.3.8 Malayalam National Language Locking Shift Table
    Malayalam: `
        0000 0D10   SP    0 0D2C 0D3E 0D57    p
        0D02 0000    !    1 0D2D 0D3F    a    q
        0D03 0D12 0D1F    2 0D2E 0D40    b    r
        0D05 0D13 0D20    3 0D2F 0D41    c    s
        0D06 0D14 0D21    4 0D30 0D42    d    t
        0D07 0D15 0D22    5 0D31 0D43    e    u
        0D08 0D16 0D23    6 0D32 0D44    f    v
        0D09 0D17 0D24    7 0D33 0000    g    w
        0D0A 0D18    )    8 0D34 0D46    h    x
        0D0B 0D19    (    9 0D35 0D47    i    y
          LF 0D1A 0D25    : 0D36 0D48    j    z
        0D0C   1) 0D26    ; 0D37 0000    k 0D60
        0000 0D1B    , 0000 0D38 0D4A    l 0D61
          CR 0D1C 0D27 0D2A 0D39 0D4B    m 0D62
        0D0E 0D1D    . 0D2B 0000 0D4C    n 0D63
        0D0F 0D1E 0D28    ? 0D3D 0D4D    o 0D79
    `,

    // A.3.9 Oriya National Language Locking Shift Table
    Oriya: `
        0B01 0B10   SP    0 0B2C 0B3E 0B56    p 
        0B02 0000    !    1 0B2D 0B3F    a    q
        0B03 0000 0B1F    2 0B2E 0B40    b    r
        0B05 0B13 0B20    3 0B2F 0B41    c    s
        0B06 0B14 0B21    4 0B30 0B42    d    t
        0B07 0B15 0B22    5 0000 0B43    e    u
        0B08 0B16 0B23    6 0B32 0B44    f    v
        0B09 0B17 0B24    7 0B33 0000    g    w
        0B0A 0B18    )    8 0000 0000    h    x
        0B0B 0B19    (    9 0B35 0B47    i    y
          LF 0B1A 0B25    : 0B36 0B48    j    z
        0B0C   1) 0B26    ; 0B37 0000    k 0B57
        0000 0B1B    , 0000 0B38 0000    l 0B60
          CR 0B1C 0B27 0B2A 0B39 0B4B    m 0B61
        0000 0B1D    . 0B2B 0B3C 0B4C    n 0B62
        0B0F 0B1E 0B28    ? 0B3D 0B4D    o 0B63
    `,

    // A.3.10 Punjabi National Language Locking Shift Table
    Punjabi: `
        0A01 0A10   SP    0 0A2C 0A3E 0A51    p
        0A02 0000    !    1 0A2D 0A3F    a    q
        0A03 0000 0A1F    2 0A2E 0A40    b    r
        0A05 0A13 0A20    3 0A2F 0A41    c    s
        0A06 0A14 0A21    4 0A30 0A42    d    t
        0A07 0A15 0A22    5 0000 0000    e    u
        0A08 0A16 0A23    6 0A32 0000    f    v
        0A09 0A17 0A24    7 0A33 0000    g    w
        0A0A 0A18    )    8 0000 0000    h    x
        0000 0A19    (    9 0A35 0A47    i    y
          LF 0A1A 0A25    : 0A36 0A48    j    z
        0000   1) 0A26    ; 0000 0000    k 0A70
        0000 0A1B    , 0000 0A38 0000    l 0A71
          CR 0A1C 0A27 0A2A 0A39 0A4B    m 0A72
        0000 0A1D    . 0A2B 0A3C 0A4C    n 0A73
        0A0F 0A1E 0A28    ? 0000 0A4D    o 0A74
    `,

    // A.3.11 Tamil National Language Locking Shift Table
    Tamil: `
        0000 0B90   SP    0 0000 0BBE 0BD0    p
        0B82 0B91    !    1 0000 0BBF    a    q
        0B83 0B92 0B9F    2 0BAE 0BC0    b    r
        0B85 0B93 0000    3 0BAF 0BC1    c    s
        0B86 0B94 0000    4 0BB0 0BC2    d    t
        0B87 0B95 0000    5 0BB1 0000    e    u
        0B88 0000 0BA3    6 0BB2 0000    f    v
        0B89 0000 0BA4    7 0BB3 0000    g    w
        0B8A 0000    )    8 0BB4 0BC6    h    x
        0000 0B99    (    9 0BB5 0BC7    i    y
          LF 0B9A 0000    : 0BB6 0BC8    j    z
        0000   1) 0000    ; 0BB7 0000    k 0BD7
        0000 0000    , 0BA9 0BB8 0BCA    l 0BF0
          CR 0B9C 0000 0BAA 0BB9 0BCB    m 0BF1
        0B8E 0000    . 0000 0000 0BCC    n 0BF2
        0B8F 0B9E 0BA8    ? 0000 0BCD    o 0BF9
    `,

    // A.3.12 Telugu National Language Locking Shift Table
    Telugu: `
        0C01 0c10   SP    0 0C2C 0C3E 0C55    p
        0C02 0C11    !    1 0C2D 0C3F    a    q
        0C03 0C12 0C1F    2 0C2E 0C40    b    r
        0C05 0C13 0C20    3 0C2F 0C41    c    s
        0C06 0C14 0C21    4 0C30 0C42    d    t
        0C07 0C15 0C22    5 0C31 0C43    e    u
        0C08 0C16 0C23    6 0C32 0C44    f    v
        0C09 0C17 0C24    7 0C33 0000    g    w
        0C0A 0C18    )    8 0000 0C46    h    x
        0C0B 0C19    (    9 0C35 0C47    i    y
          LF 0C1A 0C25    : 0C36 0C48    j    z
        0C0C   1) 0C26    ; 0C37 0000    k 0C56
        0000 0C1B    , 0000 0C38 0C4A    l 0C60
          CR 0C1C 0C27 0C2A 0C39 0C4B    m 0C61
        0C0E 0C1D    . 0C2B 0000 0C4C    n 0C62
        0C0F 0C1E 0C28    ? 0C3D 0C4D    o 0C63
    `,

    // A.3.13 Urdu National Language Locking Shift Table
    Urdu: `
        0627 062B   SP    0 0635 06BA 0654    p
        0622 062C    !    1 0636 06BB    a    q
        0628 0681 068F    2 0637 06BC    b    r
        067B 0684 068D    3 0638 0648    c    s
        0680 0683 0630    4 0639 06C4    d    t
        067E 0685 0631    5 0641 06D5    e    u
        06A6 0686 0691    6 0642 06C1    f    v
        062A 0687 0693    7 06A9 06BE    g    w
        06C2 062D    )    8 06AA 0621    h    x
        067F 062E    (    9 06AB 06CC    i    y
          LF 062F 0699    : 06AF 06D0    j    z
        0679   1) 0632    ; 06B3 06D2    k 0655
        067D 068C    , 069A 06B1 064D    l 0651
          CR 0688 0696 0633 0644 0650    m 0653
        067A 0689    . 0634 0645 064F    n 0656
        067C 068A 0698    ? 0646 0657    o 0670
    `
};

let extensions = {
    // 6.2.1.1 GSM 7 bit default alphabet extension table
    Default: `
        0000 0000 0000 0000    | 0000 0000 0000
        0000 0000 0000 0000 0000 0000 0000 0000
        0000 0000 0000 0000 0000 0000 0000 0000
        0000 0000 0000 0000 0000 0000 0000 0000
        0000    ^ 0000 0000 0000 0000 0000 0000
        0000 0000 0000 0000 0000 0000    € 0000
        0000 0000 0000 0000 0000 0000 0000 0000
        0000 0000 0000 0000 0000 0000 0000 0000
        0000 0000    { 0000 0000 0000 0000 0000
        0000 0000    } 0000 0000 0000 0000 0000
        3)   0000 0000 0000 0000 0000 0000 0000
        0000   1) 0000 0000 0000 0000 0000 0000
        0000 0000 0000    [ 0000 0000 0000 0000
        0000 0000 0000    ~ 0000 0000 0000 0000
        0000 0000 0000    ] 0000 0000 0000 0000
        0000 0000   \\ 0000 0000 0000 0000 0000
    `,

    // A.2.1 Turkish National Language Single Shift Table
    Turkish: `
        0000 0000 0000 0000    | 0000 0000 0000
        0000 0000 0000 0000 0000 0000 0000 0000
        0000 0000 0000 0000 0000 0000 0000 0000
        0000 0000 0000 0000 0000    Ş    ç    ş
        0000    ^ 0000 0000 0000 0000 0000 0000
        0000 0000 0000 0000 0000 0000    € 0000
        0000 0000 0000 0000 0000 0000 0000 0000
        0000 0000 0000 0000    Ğ 0000    ğ 0000
        0000 0000    { 0000 0000 0000 0000 0000
        0000 0000    } 0000    İ 0000    ı 0000
        3)   0000 0000 0000 0000 0000 0000 0000
        0000   1) 0000 0000 0000 0000 0000 0000
        0000 0000 0000    [ 0000 0000 0000 0000
        4)   0000 0000    ~ 0000 0000 0000 0000
        0000 0000 0000    ] 0000 0000 0000 0000
        0000 0000   \\ 0000 0000 0000 0000 0000
    `,

    // A.2.2 Spanish National Language Single Shift Table
    Spanish: `
        0000 0000 0000 0000    | 0000 0000 0000
        0000 0000 0000 0000    Á 0000    á 0000
        0000 0000 0000 0000 0000 0000 0000 0000
        0000 0000 0000 0000 0000 0000 0000 0000
        0000    ^ 0000 0000 0000 0000 0000 0000
        0000 0000 0000 0000 0000    Ú    €    ú
        0000 0000 0000 0000 0000 0000 0000 0000
        0000 0000 0000 0000 0000 0000 0000 0000
        0000 0000    { 0000 0000 0000 0000 0000
           ç 0000    } 0000    Í 0000    í 0000
        3)   0000 0000 0000 0000 0000 0000 0000
        0000   1) 0000 0000 0000 0000 0000 0000
        0000 0000 0000    [ 0000 0000 0000 0000
        4)   0000 0000    ~ 0000 0000 0000 0000
        0000 0000 0000    ] 0000 0000 0000 0000
        0000 0000   \\ 0000    Ó 0000    ó 0000
     `,

    // A.2.3 Portuguese National Language Single Shift Table
    Portuguese: `
        0000 0000 0000 0000    | 0000 0000 0000
        0000 0000 0000 0000    À 0000    Â 0000
        0000    Φ 0000 0000 0000 0000 0000 0000
        0000    Γ 0000 0000 0000 0000 0000 0000
        0000    ^ 0000 0000 0000 0000 0000 0000
        0000    Ω 0000 0000 0000    Ú    €    ú
        0000    Π 0000 0000 0000 0000 0000 0000
        0000    Ψ 0000 0000 0000 0000 0000 0000
        0000    Σ    { 0000 0000 0000 0000 0000
           ç    Θ    } 0000    Í 0000    í 0000
          3) 0000 0000 0000 0000 0000 0000 0000
           Ô   1) 0000 0000 0000    Ã 0000    ã
           ô 0000 0000    [ 0000    Õ 0000    õ
          4) 0000 0000    ~ 0000 0000 0000 0000
           Á 0000 0000    ] 0000 0000 0000 0000
           á    Ê   \\ 0000    Ó 0000    ó    â
    `,

    // A.2.4 Bengali National Language Single Shift Table
    Bengali: `
           @    < 09EC 09F6    |    P 0000 0000
           £    = 09ED 09F7    A    Q 0000 0000
           $    > 09EE 09F8    B    R 0000 0000
           ¥    ¡ 09EF 09F9    C    S 0000 0000
           ¿    ^ 09DF 09FA    D    T 0000 0000
           "    ¡ 09E0 0000    E    U    € 0000
           ¤    _ 09E1 0000    F    V 0000 0000
           %    # 09E2 0000    G    W 0000 0000
           &    *    { 0000    H    X 0000 0000
           ' 09E6    } 0000    I    Y 0000 0000
          3) 09E7 09E3 0000    J    Z 0000 0000
           *   1) 09F2 0000    K 0000 0000 0000
           + 09E8 09F3    [    L 0000 0000 0000
          4) 09E9 09F4    ~    M 0000 0000 0000
           - 09EA 09F5    ]    N 0000 0000 0000
           / 09EB   \\ 0000    O 0000 0000 0000
    `,

    // A.2.5 Gujarati National Language Single Shift Table
    Gujarati: `
           @    < 0AEA 0000    |    P 0000 0000
           £    = 0AEB 0000    A    Q 0000 0000
           $    > 0AEC 0000    B    R 0000 0000
           ¥    ¡ 0AED 0000    C    S 0000 0000
           ¿    ^ 0AEE 0000    D    T 0000 0000
           "    ¡ 0AEF 0000    E    U    € 0000
           ¤    _ 0000 0000    F    V 0000 0000
           %    # 0000 0000    G    W 0000 0000
           &    *    { 0000    H    X 0000 0000
           ' 0964    } 0000    I    Y 0000 0000
          3) 0965 0000 0000    J    Z 0000 0000
           *   1) 0000 0000    K 0000 0000 0000
           + 0AE6 0000    [    L 0000 0000 0000
          4) 0AE7 0000    ~    M 0000 0000 0000
           - 0AE8 0000    ]    N 0000 0000 0000
           / 0AE9   \\ 0000    O 0000 0000 0000
    `,

    // A.2.6 Hindi National Language Single Shift Table
    Hindi: `
           @    < 096A 095B    |    P 0000 0000
           £    = 096B 095C    A    Q 0000 0000
           $    > 096C 095D    B    R 0000 0000
           ¥    ¡ 096D 095E    C    S 0000 0000
           ¿    ^ 096E 095F    D    T 0000 0000
           "    ¡ 096F 0960    E    U    € 0000
           ¤    _ 0951 0961    F    V 0000 0000
           %    # 0952 0962    G    W 0000 0000
           &    *    { 0963    H    X 0000 0000
           ' 0964    } 0970    I    Y 0000 0000
          3) 0965 0953 0971    J    Z 0000 0000
           *   1) 0954 0000    K 0000 0000 0000
           + 0966 0958    [    L 0000 0000 0000
          4) 0967 0959    ~    M 0000 0000 0000
           - 0968 095A    ]    N 0000 0000 0000
           / 0969   \\ 0000    O 0000 0000 0000
    `,

    // A.2.7 Kannada National Language Single Shift Table
    Kannada: `
           @    < 0CEA 0000    |    P 0000 0000
           £    = 0CEB 0000    A    Q 0000 0000
           $    > 0CEC 0000    B    R 0000 0000
           ¥    ¡ 0CED 0000    C    S 0000 0000
           ¿    ^ 0CEE 0000    D    T 0000 0000
           "    ¡ 0CEF 0000    E    U    € 0000
           ¤    _ 0CDE 0000    F    V 0000 0000
           %    # 0CF1 0000    G    W 0000 0000
           &    *    { 0000    H    X 0000 0000
           ' 0964    } 0000    I    Y 0000 0000
          3) 0965 0CF2 0000    J    Z 0000 0000
           *   1) 0000 0000    K 0000 0000 0000
           + 0CE6 0000    [    L 0000 0000 0000
          4) 0CE7 0000    ~    M 0000 0000 0000
           - 0CE8 0000    ]    N 0000 0000 0000
           / 0CE9   \\ 0000    O 0000 0000 0000
    `,

    // A.2.8 Malayalam National Language Single Shift Table
    Malayalam: `
           @    < 0D6A 0D7B    |    P 0000 0000
           £    = 0D6B 0D7C    A    Q 0000 0000
           $    > 0D6C 0D7D    B    R 0000 0000
           ¥    ¡ 0D6D 0D7E    C    S 0000 0000
           ¿    ^ 0D6E 0D7F    D    T 0000 0000
           "    ¡ 0D6F 0000    E    U    € 0000
           ¤    _ 0D70 0000    F    V 0000 0000
           %    # 0D71 0000    G    W 0000 0000
           &    *    { 0000    H    X 0000 0000
           ' 0964    } 0000    I    Y 0000 0000
          3) 0965 0D72 0000    J    Z 0000 0000
           *   1) 0D73 0000    K 0000 0000 0000
           + 0D66 0D74    [    L 0000 0000 0000
          4) 0D67 0D75    ~    M 0000 0000 0000
           - 0D68 0D7A    ]    N 0000 0000 0000
           / 0D69   \\ 0000    O 0000 0000 0000
    `,

    // A.2.9 Oriya National Language Single Shift Table
    Oriya: `
           @    < 0BEA 0000    |    P 0000 0000
           £    = 0B6B 0000    A    Q 0000 0000
           $    > 0B6C 0000    B    R 0000 0000
           ¥    ¡ 0B6D 0000    C    S 0000 0000
           ¿    ^ 0B6E 0000    D    T 0000 0000
           "    ¡ 0B6F 0000    E    U    € 0000
           ¤    _ 0B5C 0000    F    V 0000 0000
           %    # 0B5D 0000    G    W 0000 0000
           &    *    { 0000    H    X 0000 0000
           ' 0964    } 0000    I    Y 0000 0000
          3) 0965 0B5F 0000    J    Z 0000 0000
           *   1) 0B70 0000    K 0000 0000 0000
           + 0B66 0B71    [    L 0000 0000 0000
          4) 0B67 0000    ~    M 0000 0000 0000
           - 0B68 0000    ]    N 0000 0000 0000
           / 0B69   \\ 0000    O 0000 0000 0000
    `,

    // A.2.10 Punjabi National Language Single Shift Table
    Punjabi: `
           @    < 0A6A 0000    |    P 0000 0000
           £    = 0A6B 0000    A    Q 0000 0000
           $    > 0A6C 0000    B    R 0000 0000
           ¥    ¡ 0A6D 0000    C    S 0000 0000
           ¿    ^ 0A6E 0000    D    T 0000 0000
           "    ¡ 0A6F 0000    E    U    € 0000
           ¤    _ 0A59 0000    F    V 0000 0000
           %    # 0A5A 0000    G    W 0000 0000
           &    *    { 0000    H    X 0000 0000
           ' 0964    } 0000    I    Y 0000 0000
          3) 0965 0A5B 0000    J    Z 0000 0000
           *   1) 0A5C 0000    K 0000 0000 0000
           + 0A66 0A5E    [    L 0000 0000 0000
          4) 0A67 0A75    ~    M 0000 0000 0000
           - 0A68 0000    ]    N 0000 0000 0000
           / 0A69   \\ 0000    O 0000 0000 0000
    `,

    // A.2.11 Tamil National Language Single Shift Table
    // In 3GPP document, Tamil character at position 0x24 is 0BEF
    // current implementation uses 0BEE instead
    Tamil: `
           @    < 0BEA 0000    |    P 0000 0000
           £    = 0BEB 0000    A    Q 0000 0000
           $    > 0BEC 0000    B    R 0000 0000
           ¥    ¡ 0BED 0000    C    S 0000 0000
           ¿    ^ 0BEE 0000    D    T 0000 0000
           "    ¡ 0BEF 0000    E    U    € 0000
           ¤    _ 0BF3 0000    F    V 0000 0000
           %    # 0BF4 0000    G    W 0000 0000
           &    *    { 0000    H    X 0000 0000
           ' 0964    } 0000    I    Y 0000 0000
          3) 0965 0BF5 0000    J    Z 0000 0000
           *   1) 0BF6 0000    K 0000 0000 0000
           + 0BE6 0BF7    [    L 0000 0000 0000
          4) 0BE7 0BF8    ~    M 0000 0000 0000
           - 0BE8 0BFA    ]    N 0000 0000 0000
           / 0BE9   \\ 0000    O 0000 0000 0000
    `,

    // A.2.12 Telugu National Language Single Shift Table
    Telugu: `
           @    < 0C6A 0C7D    |    P 0000 0000
           £    = 0C6B 0C7E    A    Q 0000 0000
           $    > 0C6C 0C7F    B    R 0000 0000
           ¥    ¡ 0C6D 0000    C    S 0000 0000
           ¿    ^ 0C6E 0000    D    T 0000 0000
           "    ¡ 0C6F 0000    E    U    € 0000
           ¤    _ 0C58 0000    F    V 0000 0000
           %    # 0C59 0000    G    W 0000 0000
           &    *    { 0000    H    X 0000 0000
           ' 0000    } 0000    I    Y 0000 0000
          3) 0000 0C78 0000    J    Z 0000 0000
           *   1) 0C79 0000    K 0000 0000 0000
           + 0CE6 0C7A    [    L 0000 0000 0000
          4) 0C67 0C7B    ~    M 0000 0000 0000
           - 0C68 0C7C    ]    N 0000 0000 0000
           / 0C69   \\ 0000    O 0000 0000 0000
    `,

    // A.2.13 Urdu National Language Single Shift Table
    Urdu: `
           @    < 06F4 0613    |    P 0000 0000
           £    = 06F5 0614    A    Q 0000 0000
           $    > 06F6 061B    B    R 0000 0000
           ¥    ¡ 06F7 061F    C    S 0000 0000
           ¿    ^ 06F8 0640    D    T 0000 0000
           "    ¡ 06F9 0652    E    U    € 0000
           ¤    _ 060C 0658    F    V 0000 0000
           %    # 060D 066B    G    W 0000 0000
           &    *    { 066C    H    X 0000 0000
           ' 0600    } 0672    I    Y 0000 0000
          3) 0601 060E 0673    J    Z 0000 0000
           *   1) 060F 06CD    K 0000 0000 0000
           + 06F0 0610    [    L 0000 0000 0000
          4) 06F1 0611    ~    M 0000 0000 0000
           - 06F2 0612    ]    N 0000 0000 0000
           / 06F3   \\ 06D4    O 0000 0000 0000
    `
};

// Special characters in previous tables
let specials = {
    "1)": "\x1b",
    "3)": "\x0c",
    "4)": "\r",
    "SP": " ",
    "CR": "\r",
    "LF": "\n"
};

/**
 * Converting 3GPP tables in charsets and extensions OPTION arrays
 */
function convertCharTable(chars) {
    console.assert(chars.length===128);
    const conv = new Array(128);
    for (let i=0; i<128; i++) {
        let char = chars[~~(i/16) + (i%16)*8];
        if (char in specials) {
            char = specials[char];
        }
        if (char.length === 4) {
            char = String.fromCodePoint(Number("0x" + char));
        }
        conv[i] = char;
    }
    return conv;
}
export const CHARSET_OPTIONS = [];
for (const lang in charsets) {
    const charset = convertCharTable(charsets[lang].trim().split(/\s+/));
    CHARSET_OPTIONS.push({name: lang, value: charset});
}
export const EXTENSION_OPTIONS = [];
for (const lang in extensions) {
    const extension = convertCharTable(extensions[lang].trim().split(/\s+/));
    EXTENSION_OPTIONS.push({name: lang, value: extension});
}
charsets = undefined;
extensions = undefined;
specials = undefined;


/**
 * GSM-7 encode the input text as a SMS
 *
 * @param {string} text
 * @param {array} [charset]
 * @param {array} [extension]
 * @param {boolean} [CRpad=true]
 * @returns {ArrayBuffer}
 */
export function toGsm7(text, charset, extension, CRpad) {
    if (!text) return [];
    if (charset === "Default") {
        charset = CHARSET_OPTIONS[0].value;
    }
    if (extension === "Default") {
        extension = EXTENSION_OPTIONS[0].value;
    }

    // step #1 : encoding with given charset and extension
    const codePoints = [];
    for (const char of text) {
        let c = charset.indexOf(char);
        if (c===-1) {
            c = extension.indexOf(char);
            if (c===-1) {
                throw new OperationError("character '" + char + "' is not present in current charset+extension.<br>" +
                                         "A real device would encode this SMS using UCS-2 (UTF-16)");
            }
            codePoints.push(0x1b);
        }
        codePoints.push(c);
    }

    // optional step #2: final CR to cope with unexpected encoding of 0x00 or to affirm a wanted final CR
    if (CRpad) {
        if ((codePoints.length % 8 === 7) || ((codePoints.length % 8 === 0) && codePoints[codePoints.length-1] === 13)) {
            codePoints.push(13);
        }
    }

    // step #3: 7bit packing
    const sms = [];
    let mod;
    let previous;
    for (let i = 0; i < codePoints.length; i++) {
        const c = codePoints[i];
        mod = i % 8;
        if (mod === 0) {
            previous = c;
        } else {
            const b = ((c << (8 - mod)) & 0xff) + previous;
            previous = c >> mod;
            sms.push(b);
        }
    }
    if (mod !== 7) {
        sms.push(previous);
    }
    return sms;
}


/**
 * GSM-7 decode the input SMS as text
 *
 * @param {ArrayBuffer} sms
 * @param {array} [charset]
 * @param {array} [extension]
 * @param {boolean} [CRpad=true]
 * @returns {string}
 */
export function fromGsm7(sms, charset, extension, CRpad) {
    if (sms.length === 0) return "";
    if (charset === "Default") {
        charset = CHARSET_OPTIONS[0].value;
    }
    if (extension === "Default") {
        extension = EXTENSION_OPTIONS[0].value;
    }

    // step #1: 7bit unpacking
    const codePoints = [];
    let previousBits = 0;
    for (let i = 0; i < sms.length; i++) {
        const b = sms[i];
        const mod = i % 7;
        let c = previousBits + ((b << mod) & 0x7f);
        previousBits = b >> (7-mod);
        codePoints.push(c);
        if (mod===6) {
            c = previousBits;
            previousBits = 0;
            codePoints.push(c);
        }
    }

    // optional step #2: remove final CR when on octet boundary
    if (CRpad) {
        if ((codePoints.length % 8 === 0) && codePoints[codePoints.length-1] === 13) {
            codePoints.pop();
        }
    }

    // step #3: decoding with given charset and extension
    const text = [];
    let esc = false;
    for (const c of codePoints) {
        if (esc) {
            let char = extension[c];
            if (char === "\x00") {
                char = charset[c];
            } else if (char === "\x1b") {
                char = " ";
            }
            text.push(char);
            esc = false;
        } else if (c === 0x1b) {
            esc = true;
        } else {
            text.push(charset[c]);
        }
    }
    return text.join("");
}

