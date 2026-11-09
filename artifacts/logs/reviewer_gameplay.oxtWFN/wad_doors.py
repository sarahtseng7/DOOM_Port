# reviewer_gameplay Njlpzg: read-only parse of E1M1 manual door linedefs near the player start
import struct, sys, json, math
d = open(sys.argv[1], 'rb').read()
n, off = struct.unpack_from('<4xii', d)
dirs = [struct.unpack_from('<ii8s', d, off + 16*i) for i in range(n)]
names = [x[2].rstrip(b'\0').decode() for x in dirs]
i = names.index('E1M1'); lump = {names[j]: dirs[j] for j in range(i+1, i+11)}
def rd(nm, fmt):
    p, sz, _ = lump[nm]; s = struct.calcsize(fmt)
    return [struct.unpack_from(fmt, d, p + k*s) for k in range(sz // s)]
V = rd('VERTEXES', '<hh'); L = rd('LINEDEFS', '<hhhhhhh'); T = rd('THINGS', '<hhhhh')
S = rd('SIDEDEFS', '<hh8s8s8sh'); SEC = rd('SECTORS', '<hh8s8shhh')
st = [t for t in T if t[3] == 1][0]
out = []
for k, l in enumerate(L):
    if l[3] in (1, 31, 117, 118):
        a, b = V[l[0]], V[l[1]]; mx, my = (a[0]+b[0])/2, (a[1]+b[1])/2
        back = S[l[6]][5] if l[6] != -1 else None
        out.append(dict(line=k, special=l[3], v1=a, v2=b, mid=(mx, my), dist=round(math.hypot(mx-st[0], my-st[1])),
                        backSector=back, backFloorCeil=SEC[back][:2] if back is not None else None))
out.sort(key=lambda o: o['dist'])
print(json.dumps(dict(start=st, doors=out[:6], zombies=[t[:2] for t in T if t[3] == 3004][:6]), indent=1))
