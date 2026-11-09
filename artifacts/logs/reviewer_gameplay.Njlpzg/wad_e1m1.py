# reviewer_gameplay xPaDae: read-only parse of E1M1 exit linedefs and items from assets/doom1.wad
import struct, sys, json
d = open(sys.argv[1], 'rb').read()
n, off = struct.unpack_from('<4xii', d)
dirs = [struct.unpack_from('<ii8s', d, off + 16*i) for i in range(n)]
names = [x[2].rstrip(b'\0').decode() for x in dirs]
i = names.index('E1M1')
lump = {names[j]: dirs[j] for j in range(i+1, i+11)}
def rd(nm, fmt):
    p, sz, _ = lump[nm]; s = struct.calcsize(fmt)
    return [struct.unpack_from(fmt, d, p + k*s) for k in range(sz // s)]
V = rd('VERTEXES', '<hh'); L = rd('LINEDEFS', '<hhhhhhh'); T = rd('THINGS', '<hhhhh')
ex = [dict(line=k, special=l[3], v1=V[l[0]], v2=V[l[1]]) for k, l in enumerate(L) if l[3] in (11, 51, 52, 124)]
start = [t for t in T if t[3] == 1]
items = [dict(type=t[3], x=t[0], y=t[1]) for t in T if t[3] in (2007, 2008, 2011, 2012, 2014, 2015, 2018, 2048)]
print(json.dumps(dict(exits=ex, start=start, items=items)))
