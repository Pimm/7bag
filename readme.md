# 7bag

Deceptively simple compression algorithm for byte streams.

# Introduction

7bag divides data into blocks of 8 bytes and prefixes each block with a 3-byte tag. A tag indicates whether the bytes of the block are in the "_bag_": a set of 7 frequently occurring bytes. Any byte in the bag is omitted from the compressed representation.

7bag is effective only when the bag bytes are very common, such as in structured text formats. In JSON, for example, the whitespace character, `"`, and `:` are especially popular.

In the best case, the algorithm reduces size by 62.5%; in the worst case, it increases it by a little over 37.5%. Both compression and decompression are single-pass operations which read every byte exactly once.

# License (X11/MIT)
Copyright (c) 2025 Pimm "de Chinchilla" Hogeling

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

**The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. in no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings in the Software.**