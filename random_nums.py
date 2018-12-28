# encoding: utf-8
"""
@author: 叶玉
"""
import random



def random_nums():
    nums = '1234567890qwertyuiopasdfghjklzxcvbnm'
    code = ''
    for n in range(4):
        code += random.choice(nums)
    return code
