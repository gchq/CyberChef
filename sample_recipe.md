# Ready-To-Go Sample Recipe 

## tcpdump (no ASCII) Daily Use

1. tcpdump (no ASCII) convert to plaintext (e.g. <code>0x0000: 0020 0A0D</code>)
2. URL decode loop (e.g. <code>%3d</code> to <code>=</code>)
3. From HTML Entity (e.g. <code>&amp;</code> to <code>&</code>)
4. From 0x[Hex] (e.g. <code>0x33</code> to <code>!</code>)
5. From Char(Hex) (e.g. <code>char(33)</code> to <code>!</code>)
 
    	[{"op":"From nTcpdump","args":[]},
    	{"op":"URL Decode","args":[]},
    	{"op":"Conditional Jump","args":["\\%([0-9a-fA-F]{2,})","-1","45"]},
    	{"op":"From HTML Entity","args":[]},
    	{"op":"From 0x[Hex]","args":[]},
    	{"op":"From Char(Hex)","args":[]}]