#!/usr/bin/env python
# (c) 2014 Rob Wu <rob@robwu.nl> (https://robwu.nl)
# Py2 and Py3-compatible
# Generate a Maxthon package for a given directory.
import os
import struct
import sys


def i2b(n):
    """
    Converts an integer to a 32-bit little-endian binary representation.
    """
    return struct.pack('<I', n)


def getPaths(inputdir):
    """
    inputdir = path to directory containing the mxaddon files
    returns a list of tuples:
        [ ( path_to_file, name_of_file_in_mxpackage ), ...]
    """
    filepaths = []

    defdotjsonpath = os.path.join(inputdir, 'def.json')
    if not os.path.isfile(defdotjsonpath):
        print('Warning: def.json not found at: %s!' % defdotjsonpath)

    # Get input files
    for dirpath, _, filenames in os.walk(inputdir):
        for filename in filenames:
            if filename.startswith('.'):
                # Skip dotfiles
                continue

            fullfilepath = os.path.join(dirpath, filename)
            if not os.path.isfile(fullfilepath):
                continue

            mxFileName = os.path.relpath(fullfilepath, inputdir)
            mxFileName = mxFileName.replace('/', '\\')
            filepaths.append((fullfilepath, mxFileName))
    filepaths.sort(key=lambda pair: pair[1])
    return filepaths


def hashMxFilename(widecharSequence):
    """
    Generate the hash for a given sequence of wide chars (8 bits)
    (Looks like a variant of the Fowler-Noll-Vo hash function)
    """
    hashcode = 0x811C9DC5
    for widecharcode in widecharSequence:
        # Convert lowercase a-z to uppercase
        if 0x41 <= widecharcode <= 0x5A:
            widecharcode |= 0x20
        hashcode *= 0x1000193
        hashcode &= 0xFFFFFFFF
        hashcode ^= widecharcode
    return hashcode


def createMxPak1(indir):
    """
    indir = directory containing files
    outfile = Path to .mxaddon
    """
    filepaths = getPaths(indir)

    headers = bytearray()
    # Magic header plus padding (32 bytes)
    headers += b'mx pak1' + 25*b'\x00'
    # Number of files (unsigned integer, LE)
    headers += i2b(len(filepaths))

    # Start offset of data
    offset = len(headers)
    # Calculate the byte size of all headers
    for (_, mxFileName) in filepaths:
        # File path hash
        offset += 4
        # file path length
        offset += 4
        # file path (UTF-16, so multiply string length by 2)
        offset += 2*len(mxFileName)
        # Start offset (integer)
        offset += 4
        # Size of file content (integer)
        offset += 4

    content = bytes()
    for (fullfilepath, mxFileName) in filepaths:
        # Python2 compatibility: convert byte strings to unicode strings
        if not isinstance(u'', str) and isinstance(mxFileName, str):
            mxFileName = mxFileName.decode('UTF-8')

        # File path hash
        headers += i2b(hashMxFilename(map(ord, mxFileName)))

        # Length of file path (in characters, not bytes)
        # (unsigned integer, LE)
        headers += i2b(len(mxFileName))

        # File path (UTF-16 string)
        headers += mxFileName.encode('UTF-16LE')

        # Start offset of file content
        headers += i2b(offset)

        with open(fullfilepath, 'rb') as f:
            filecontent = f.read()

        if mxFileName.lower() == "def.json":
            filecontent = prependBOMifNotUTF8(filecontent)
        # Size of file
        headers += i2b(len(filecontent))

        offset += len(filecontent)

        content += filecontent
    return headers + content


def prependBOMifNotUTF8(data):
    """
    Ensures that def.json is either UTF16 or UTF-8 with BOM.
    data = byte sequence
    Returns the same byte sequence, optionally prefixed with a UTF8 BOM.
    """
    BOM = b'\xEF\xBB\xBF'
    if data.startswith(BOM):
        # UTF-8 BOM
        return data
    try:
        data.decode('utf-16')
        if b'\x00[' in data or b'[\x00' in data:
            # If encoded as UTF-16, then it must contain the [ somewhere,
            # together with a NUL byte. A valid def.json contains a "[".
            # The "[" character is encoded as "\x00[" or "[\x00" in UTF-16.
            return data
    except UnicodeDecodeError:
        # If decoding fails, then it is not UTF-16
        pass
    # Try to interpret the data as UTF-8.
    try:
        data.decode('utf-8')
        # If decoding succeeds, then it is UTF-8
        return BOM + data
    except UnicodeDecodeError as e:
        # http://extension.maxthon.com/upload rejects files that are not
        # encoded as UTF-16 or UTF-8.
        sys.stderr.write("WARNING: def.json is not encoded as UTF-16 or ")
        sys.stderr.write("UTF-8. Please save the file as UTF-8 or UTF-16.")
        sys.stderr.write("\nUnicodeDecodeError: %s\n" % e)
        return data


if __name__ == "__main__":
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        print("")
        print("Usage: %s [inputdir] [output file]" % sys.argv[0])
        print("Overwrites [outputfile] with the packed content of [inputdir].")
        print("[output file] is optional and defaults to <inputdir>.maxaddon")
        print("")
        sys.exit(1)

    indir = os.path.abspath(sys.argv[1])
    if len(sys.argv) == 3:
        outfile = sys.argv[2]
    else:
        outfile = indir + '.mxaddon'

    if not os.path.isdir(indir):
        print("Exiting early because %s is not a directory!" % indir)
        sys.exit(2)

    content = createMxPak1(indir)
    with open(outfile, 'wb') as f:
        f.write(content)
    print("Written %d bytes to %s" % (len(content), outfile))
